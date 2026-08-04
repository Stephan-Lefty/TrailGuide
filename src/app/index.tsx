import { router } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { LocationStatusCard } from '../components/hike/LocationStatusCard';
import { SosButton } from '../components/sos/SosButton';
import { useActiveHike } from '../hooks/useActiveHike';
import { isOnboardingComplete } from '../services/storage/settingsStore';
import { semanticColors } from '../theme/colors';
import { fontFamily, fontSize, radius } from '../theme/typography';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { hike, endHike } = useActiveHike();

  useEffect(() => {
    if (!isOnboardingComplete()) {
      router.replace('/onboarding');
    }
  }, []);

  function confirmEndHike() {
    Alert.alert(t('hike.endConfirmTitle'), t('hike.endConfirmQuestion'), [
      { text: t('hike.endNormal'), onPress: () => endHike(false) },
      { text: t('hike.endIncident'), style: 'destructive', onPress: () => endHike(true) },
      { text: t('hike.cancel'), style: 'cancel' },
    ]);
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => router.push('/settings')}
        hitSlop={12}
        style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={t('settingsMenu.title')}
      >
        <Text style={styles.settingsButtonIcon}>⚙</Text>
      </Pressable>

      <View style={styles.header}>
        <Image source={require('../../assets/app-icon-inapp.png')} style={styles.headerIcon} />
        <Text style={styles.title}>{t('common.appName')}</Text>
        <Text style={styles.subtitle}>{t('common.tagline')}</Text>
      </View>

      <View style={styles.hikeSection}>
        {hike ? (
          <>
            <Text style={styles.activeSince}>
              {t('hike.activeSince', {
                time: new Date(hike.startedAt).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              })}
            </Text>
            <Pressable onPress={confirmEndHike} style={({ pressed }) => [styles.endButton, pressed && styles.pressed]}>
              <Text style={styles.endButtonText}>{t('hike.endButton')}</Text>
            </Pressable>
            <LocationStatusCard active={!!hike} />
          </>
        ) : (
          <>
            <Pressable
              onPress={() => router.push('/hike/start')}
              style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}
            >
              <Text style={styles.startButtonText}>{t('hike.startButton')}</Text>
            </Pressable>
            <Text style={styles.explanation}>{t('home.startHikeExplanation')}</Text>
          </>
        )}
      </View>

      <View style={styles.sosSection}>
        <View style={styles.sosButtonWrapper}>
          <SosButton disabled={!hike} />
        </View>
        <Text style={styles.explanation}>{hike ? t('home.sosExplanation') : t('home.sosDisabledHint')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: semanticColors.background,
    padding: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  settingsButton: {
    position: 'absolute',
    top: 32,
    right: 24,
    zIndex: 1,
    padding: 4,
  },
  settingsButtonIcon: {
    fontSize: fontSize.large,
    color: semanticColors.textSecondary,
  },
  header: {
    gap: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  headerIcon: {
    width: 88,
    height: 88,
    borderRadius: radius.large,
    marginBottom: 4,
  },
  title: {
    fontFamily: fontFamily.serif,
    fontSize: fontSize.xLarge,
    color: semanticColors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.medium,
    color: semanticColors.textSecondary,
    textAlign: 'center',
  },
  hikeSection: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  sosSection: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  sosButtonWrapper: {
    marginTop: 14,
    marginBottom: 14,
  },
  explanation: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    color: semanticColors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  activeSince: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.medium,
    color: semanticColors.textSecondary,
  },
  startButton: {
    backgroundColor: semanticColors.primary,
    borderRadius: radius.pill,
    paddingVertical: 18,
    paddingHorizontal: 36,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 14,
  },
  startButtonText: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.medium,
    fontWeight: '700',
    color: '#ffffff',
  },
  endButton: {
    backgroundColor: semanticColors.surface,
    borderRadius: radius.pill,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 14,
  },
  endButtonText: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.medium,
    fontWeight: '600',
    color: semanticColors.textPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
});
