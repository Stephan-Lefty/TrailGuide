import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useActiveHike } from '../../hooks/useActiveHike';
import { pickContactWithPhone } from '../../services/contacts/contactPicker';
import { setTourContact } from '../../services/contacts/contactsRepository';
import { semanticColors } from '../../theme/colors';
import { fontFamily, fontSize, radius } from '../../theme/typography';

export default function StartHikeScreen() {
  const { t } = useTranslation();
  const { startHike } = useActiveHike();
  const [label, setLabel] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  async function handlePickContact() {
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
    setLabel(result.contact.name);
    setPhoneNumber(result.contact.phoneNumber);
  }

  async function handleStart() {
    const { hike, tracking } = await startHike();
    if (label.trim() && phoneNumber.trim()) {
      await setTourContact(hike.id, label.trim(), phoneNumber.trim());
    }
    if (!tracking.success) {
      Alert.alert(t('hike.backgroundTrackingDeniedTitle'), t('hike.backgroundTrackingDeniedBody'), [
        { text: t('hike.okay'), onPress: () => router.replace('/') },
      ]);
      return;
    }
    router.replace('/');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('hike.tourContactTitle')}</Text>
      <Pressable onPress={handlePickContact} hitSlop={8} style={styles.pickContactRow}>
        <Text style={styles.pickContactLink}>{t('onboarding.pickFromContacts')}</Text>
      </Pressable>
      <Text style={styles.hint}>{t('hike.tourContactHint')}</Text>

      <TextInput
        style={styles.input}
        placeholder={t('onboarding.namePlaceholder')}
        placeholderTextColor={semanticColors.textSecondary}
        value={label}
        onChangeText={setLabel}
      />
      <TextInput
        style={styles.input}
        placeholder={t('onboarding.phonePlaceholder')}
        placeholderTextColor={semanticColors.textSecondary}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <Pressable onPress={handleStart} style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}>
        <Text style={styles.startButtonText}>{t('hike.startButton')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.background,
    padding: 24,
    paddingTop: 32,
  },
  title: {
    fontFamily: fontFamily.serif,
    fontSize: fontSize.large,
    color: semanticColors.textPrimary,
    marginBottom: 4,
  },
  pickContactRow: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  pickContactLink: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    color: semanticColors.primary,
    fontWeight: '600',
  },
  hint: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    color: semanticColors.textSecondary,
    marginBottom: 20,
  },
  input: {
    backgroundColor: semanticColors.surface,
    borderRadius: radius.medium,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.medium,
    color: semanticColors.textPrimary,
    marginBottom: 12,
  },
  startButton: {
    backgroundColor: semanticColors.primary,
    borderRadius: radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  startButtonText: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.medium,
    fontWeight: '700',
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.85,
  },
});
