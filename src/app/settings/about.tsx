import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { semanticColors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';

const MAKER_EMAIL = 'info@naturlust.net';
const MORE_INFO_URL = 'https://naturlust.net/trailguide-app/';

export default function SettingsAboutScreen() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const appVersion = Constants.expoConfig?.version ?? '?';

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.makerLabel}>{t('settingsAbout.makerLabel')}</Text>
        <Text style={styles.makerName}>{t('settingsAbout.makerName')}</Text>
        <Pressable onPress={() => Linking.openURL(`mailto:${MAKER_EMAIL}`)} hitSlop={8}>
          <Text style={styles.makerEmail}>{MAKER_EMAIL}</Text>
        </Pressable>

        <Text style={styles.moreInfoLabel}>{t('settingsAbout.moreInfoLabel')}</Text>
        <Text style={styles.moreInfoText}>
          {t('settingsAbout.moreInfoText')}{' '}
          <Text style={styles.moreInfoLink} onPress={() => Linking.openURL(MORE_INFO_URL)}>
            {MORE_INFO_URL}
          </Text>
        </Text>

        <Text style={styles.notice}>{t('settingsAbout.notice')}</Text>
      </View>
      <View>
        <Text style={styles.version}>{t('settingsAbout.version', { version: appVersion })}</Text>
        <Text style={styles.copyright}>{t('settingsAbout.copyright', { year })}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.background,
    padding: 24,
    justifyContent: 'space-between',
  },
  makerLabel: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    color: semanticColors.textSecondary,
    marginBottom: 4,
  },
  makerName: {
    fontFamily: fontFamily.serif,
    fontSize: fontSize.large,
    color: semanticColors.textPrimary,
    marginBottom: 4,
  },
  makerEmail: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.medium,
    color: semanticColors.danger,
    fontWeight: '600',
    marginBottom: 20,
  },
  moreInfoLabel: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    color: semanticColors.textSecondary,
    marginBottom: 4,
    marginTop: 4,
  },
  moreInfoText: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.medium,
    color: semanticColors.textPrimary,
    lineHeight: 22,
    marginBottom: 20,
  },
  moreInfoLink: {
    color: semanticColors.danger,
    fontWeight: '600',
  },
  notice: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.medium,
    color: semanticColors.textPrimary,
    lineHeight: 22,
  },
  version: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    color: semanticColors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  copyright: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    color: semanticColors.textSecondary,
    textAlign: 'center',
  },
});
