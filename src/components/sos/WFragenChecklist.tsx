import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { semanticColors } from '../../theme/colors';
import { fontFamily, fontSize, radius } from '../../theme/typography';

interface WFrage {
  frage: string;
  hinweis: string;
}

/**
 * Ist standardmaessig eingeklappt, damit die Checkliste nicht dauerhaft
 * viel Platz auf dem SOS-Screen einnimmt. Waehrend eines echten Anrufs
 * uebernimmt die native Telefon-App den Bildschirm - Nutzer koennen aber
 * waehrend des Gespraechs zurueck in die App wechseln und die Liste
 * bei Bedarf aufklappen.
 */
export function WFragenChecklist() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const items = t('wFragen.items', { returnObjects: true }) as WFrage[];

  return (
    <View>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        style={({ pressed }) => [styles.toggle, pressed && styles.togglePressed]}
      >
        <Text style={styles.toggleText}>{open ? t('sos.wFragenHide') : t('sos.wFragenShow')}</Text>
        <Text style={styles.toggleChevron}>{open ? '▲' : '▼'}</Text>
      </Pressable>
      {open && (
        <View style={styles.container}>
          {items.map((item, index) => (
            <View key={item.frage} style={styles.item}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{index + 1}</Text>
              </View>
              <View style={styles.textBlock}>
                <Text style={styles.frage}>{item.frage}</Text>
                <Text style={styles.hinweis}>{item.hinweis}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: semanticColors.surface,
    borderRadius: radius.medium,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  togglePressed: {
    opacity: 0.85,
  },
  toggleText: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.medium,
    fontWeight: '600',
    color: semanticColors.textPrimary,
  },
  toggleChevron: {
    fontSize: fontSize.small,
    color: semanticColors.textSecondary,
  },
  container: {
    backgroundColor: semanticColors.surface,
    borderRadius: radius.large,
    padding: 16,
    marginTop: 8,
    gap: 14,
  },
  item: {
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: semanticColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    fontWeight: '700',
    color: '#ffffff',
  },
  textBlock: {
    flex: 1,
  },
  frage: {
    fontFamily: fontFamily.serif,
    fontSize: fontSize.medium,
    color: semanticColors.textPrimary,
    marginBottom: 2,
  },
  hinweis: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    color: semanticColors.textSecondary,
  },
});
