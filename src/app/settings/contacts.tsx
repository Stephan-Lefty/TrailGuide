import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { pickContactWithPhone } from '../../services/contacts/contactPicker';
import {
  addPermanentContact,
  listPermanentContacts,
  removeContact,
  updatePermanentContact,
} from '../../services/contacts/contactsRepository';
import { semanticColors } from '../../theme/colors';
import { fontFamily, fontSize, radius } from '../../theme/typography';
import { MAX_PERMANENT_CONTACTS } from '../../types/emergencyNumber';

interface ContactDraft {
  id: string | null;
  label: string;
  phoneNumber: string;
}

function emptyDrafts(): ContactDraft[] {
  return Array.from({ length: MAX_PERMANENT_CONTACTS }, () => ({ id: null, label: '', phoneNumber: '' }));
}

export default function SettingsContactsScreen() {
  const { t } = useTranslation();
  const [drafts, setDrafts] = useState<ContactDraft[]>(emptyDrafts());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listPermanentContacts().then((contacts) => {
      const next = emptyDrafts();
      contacts.forEach((contact, index) => {
        if (index < next.length) {
          next[index] = { id: contact.id, label: contact.label, phoneNumber: contact.phoneNumber };
        }
      });
      setDrafts(next);
      setLoading(false);
    });
  }, []);

  function updateDraft(index: number, field: 'label' | 'phoneNumber', value: string) {
    setDrafts((prev) => prev.map((draft, i) => (i === index ? { ...draft, [field]: value } : draft)));
  }

  async function handlePickContact(index: number) {
    const result = await pickContactWithPhone();
    if (result.status === 'no_phone_number') {
      Alert.alert(t('onboarding.noPhoneNumberTitle'), t('onboarding.noPhoneNumberBody'));
      return;
    }
    if (result.status === 'permission_denied') {
      Alert.alert(t('onboarding.contactsPermissionDeniedTitle'), t('onboarding.contactsPermissionDeniedBody'));
      return;
    }
    if (result.status === 'error') {
      Alert.alert(t('onboarding.contactsErrorTitle'), t('onboarding.contactsErrorBody'));
      return;
    }
    if (result.status === 'cancelled') return;
    setDrafts((prev) =>
      prev.map((draft, i) =>
        i === index ? { ...draft, label: result.contact.name, phoneNumber: result.contact.phoneNumber } : draft,
      ),
    );
  }

  async function save() {
    const filled = drafts.filter((draft) => draft.label.trim() && draft.phoneNumber.trim());
    if (filled.length === 0) {
      Alert.alert(t('onboarding.atLeastOneRequiredTitle'), t('onboarding.atLeastOneRequiredBody'));
      return;
    }

    setSaving(true);
    try {
      for (const draft of drafts) {
        const label = draft.label.trim();
        const phoneNumber = draft.phoneNumber.trim();
        const isFilled = Boolean(label && phoneNumber);

        if (draft.id && isFilled) {
          await updatePermanentContact(draft.id, label, phoneNumber);
        } else if (draft.id && !isFilled) {
          await removeContact(draft.id);
        } else if (!draft.id && isFilled) {
          await addPermanentContact(label, phoneNumber);
        }
      }
      router.back();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <View style={styles.container} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('settingsContacts.title')}</Text>
      <Text style={styles.subtitle}>{t('settingsContacts.subtitle')}</Text>

      {drafts.map((draft, index) => (
        <View key={index} style={styles.slot}>
          <View style={styles.slotHeader}>
            <Text style={styles.slotLabel}>
              {t('onboarding.contactSlotLabel', { n: index + 1 })}
              <Text style={styles.slotMarker}>
                {index === 0 ? t('onboarding.requiredMarker') : t('onboarding.optionalMarker')}
              </Text>
            </Text>
            <Pressable onPress={() => handlePickContact(index)} hitSlop={8}>
              <Text style={styles.pickContactLink}>{t('onboarding.pickFromContacts')}</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            placeholder={t('onboarding.namePlaceholder')}
            placeholderTextColor={semanticColors.textSecondary}
            value={draft.label}
            onChangeText={(value) => updateDraft(index, 'label', value)}
          />
          <TextInput
            style={styles.input}
            placeholder={t('onboarding.phonePlaceholder')}
            placeholderTextColor={semanticColors.textSecondary}
            value={draft.phoneNumber}
            onChangeText={(value) => updateDraft(index, 'phoneNumber', value)}
            keyboardType="phone-pad"
          />
        </View>
      ))}

      <Pressable onPress={save} disabled={saving} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
        <Text style={styles.saveButtonText}>{t('settingsContacts.save')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.background,
  },
  content: {
    padding: 24,
    paddingTop: 24,
    paddingBottom: 48,
  },
  title: {
    fontFamily: fontFamily.serif,
    fontSize: fontSize.xLarge,
    color: semanticColors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.medium,
    color: semanticColors.textSecondary,
    marginBottom: 28,
  },
  slot: {
    marginBottom: 20,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotLabel: {
    fontFamily: fontFamily.serif,
    fontSize: fontSize.medium,
    color: semanticColors.textPrimary,
  },
  slotMarker: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    color: semanticColors.textSecondary,
  },
  pickContactLink: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    color: semanticColors.primary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: semanticColors.surface,
    borderRadius: radius.medium,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.medium,
    color: semanticColors.textPrimary,
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: semanticColors.primary,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.medium,
    fontWeight: '700',
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.8,
  },
});
