import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useLiveLocation } from '../../hooks/useLiveLocation';
import { semanticColors } from '../../theme/colors';
import { fontFamily, fontSize, radius } from '../../theme/typography';

interface LocationStatusCardProps {
  /** Nur waehrend einer aktiven Wanderung anzeigen/aktualisieren. */
  active: boolean;
}

/**
 * Sichtbare Rueckmeldung direkt nach dem Start einer Wanderung: zeigt, dass
 * der Standort tatsaechlich erfasst wurde (Land + GPS-Genauigkeit), damit
 * der Nutzer Vertrauen hat, dass die App korrekt lokalisiert ist.
 */
export function LocationStatusCard({ active }: LocationStatusCardProps) {
  const { t } = useTranslation();
  const location = useLiveLocation(active);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  if (location.permissionDenied) {
    return (
      <View style={styles.card}>
        <Text style={styles.warning}>{t('hike.locationPermissionDenied')}</Text>
      </View>
    );
  }

  if (!location.lastUpdatedAt) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{t('hike.locationStatusTitle')}</Text>
        <Text style={styles.hint}>{t('hike.locationSearching')}</Text>
      </View>
    );
  }

  const secondsAgo = Math.max(0, Math.round((now - location.lastUpdatedAt) / 1000));

  const locationLabel = location.countryName
    ? t('hike.locationDetected', { country: location.countryName })
    : t('hike.locationUnknownArea');
  const accuracyLabel =
    location.accuracyMeters !== null ? t('hike.locationAccuracy', { meters: Math.round(location.accuracyMeters) }) : null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('hike.locationStatusTitle')}</Text>
      <Text style={styles.hint}>{accuracyLabel ? `${locationLabel} · ${accuracyLabel}` : locationLabel}</Text>
      <Text style={styles.timestamp}>
        {secondsAgo < 2 ? t('hike.locationUpdatedJustNow') : t('hike.locationUpdatedSecondsAgo', { seconds: secondsAgo })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: semanticColors.surface,
    borderRadius: radius.medium,
    paddingVertical: 8,
    paddingHorizontal: 14,
    width: '100%',
    gap: 2,
  },
  title: {
    fontFamily: fontFamily.serif,
    fontSize: fontSize.small,
    color: semanticColors.textPrimary,
  },
  hint: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    color: semanticColors.textSecondary,
  },
  timestamp: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    color: semanticColors.primary,
  },
  warning: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    color: semanticColors.danger,
  },
});
