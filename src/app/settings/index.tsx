import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { factoryResetApp } from '../../services/reset/factoryReset';
import { semanticColors } from '../../theme/colors';
import { fontFamily, fontSize, radius } from '../../theme/typography';

export default function SettingsMenuScreen() {
  const { t } = useTranslation();

  function handleFactoryReset() {
    Alert.alert(t('settingsMenu.resetConfirmTitle'), t('settingsMenu.resetConfirmBody'), [
      { text: t('hike.cancel'), style: 'cancel' },
      { text: t('settingsMenu.resetConfirm'), style: 'destructive', onPress: () => factoryResetApp() },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.menuGroup}>
        <Pressable
          onPress={() => router.push('/settings/contacts')}
          style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
        >
          <Text style={styles.menuItemText}>{t('settingsContacts.title')}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/hikes')}
          style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
        >
          <Text style={styles.menuItemText}>{t('hikesList.title')}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/settings/about')}
          style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
        >
          <Text style={styles.menuItemText}>{t('settingsAbout.title')}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={handleFactoryReset}
        style={({ pressed }) => [styles.resetItem, pressed && styles.pressed]}
      >
        <Text style={styles.resetItemText}>{t('settingsMenu.resetTitle')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.background,
    padding: 24,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  menuGroup: {
    gap: 12,
  },
  menuItem: {
    backgroundColor: semanticColors.surface,
    borderRadius: radius.medium,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemText: {
    fontFamily: fontFamily.serif,
    fontSize: fontSize.medium,
    color: semanticColors.textPrimary,
  },
  chevron: {
    fontSize: fontSize.large,
    color: semanticColors.textSecondary,
  },
  resetItem: {
    borderRadius: radius.medium,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: semanticColors.danger,
  },
  resetItemText: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.medium,
    fontWeight: '600',
    color: semanticColors.danger,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
