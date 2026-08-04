import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useActiveHike } from '../../hooks/useActiveHike';
import { useEmergencyNumbers } from '../../hooks/useEmergencyNumbers';
import { useSavedContacts } from '../../hooks/useSavedContacts';
import { detectCountry } from '../../services/country/countryLookupService';
import { semanticColors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';
import { CountrySelector } from './CountrySelector';
import { EmergencyNumberRow } from './EmergencyNumberRow';
import { ShareLinkAction } from './ShareLinkAction';
import { WFragenChecklist } from './WFragenChecklist';

export function SosSheet() {
  const { t } = useTranslation();
  const [detectedCountryCode, setDetectedCountryCode] = useState<string | null>(null);
  const [manualCountryCode, setManualCountryCode] = useState<string | null>(null);
  const effectiveCountryCode = manualCountryCode ?? detectedCountryCode;
  const { universal, countryEntry } = useEmergencyNumbers(effectiveCountryCode);
  const { contacts } = useSavedContacts();
  const { hike } = useActiveHike();

  useEffect(() => {
    let cancelled = false;

    async function locate() {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const position = await Location.getLastKnownPositionAsync();
        if (!position || cancelled) return;
        const match = detectCountry({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        if (!cancelled && match) {
          setDetectedCountryCode(match.iso2);
        }
      } catch {
        // Ohne Standort bleibt einfach nur die 112 sichtbar - das ist immer korrekt.
      }
    }

    locate();
    return () => {
      cancelled = true;
    };
  }, []);

  const countryDisplayName = countryEntry
    ? t(`countries.${countryEntry.countryCode}`, { defaultValue: countryEntry.countryName })
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>{t('sos.sectionEmergency')}</Text>
      <EmergencyNumberRow
        label={t('sos.universalLabel')}
        number={universal.number}
        emphasized
        holdDurationMs={5000}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('sos.chooseCountryLabel')}</Text>
        <CountrySelector selectedCountryCode={manualCountryCode} onSelect={setManualCountryCode} />
      </View>

      {countryEntry && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('sos.inCountry', { country: countryDisplayName })}{' '}
            <Text style={styles.sectionTitleHint}>
              {manualCountryCode ? t('sos.manuallySelected') : t('sos.autoDetected')}
            </Text>
          </Text>
          {countryEntry.numbers.map((entry) => (
            <EmergencyNumberRow
              key={entry.number}
              label={entry.label}
              number={entry.number}
              holdDurationMs={5000}
            />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('sos.sectionWFragen')}</Text>
        <WFragenChecklist />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('sos.sectionContacts')}</Text>
        {contacts.length === 0 ? (
          <Text style={styles.emptyHint}>{t('sos.noContacts')}</Text>
        ) : (
          contacts.map((contact) => (
            <EmergencyNumberRow key={contact.id} label={contact.label} number={contact.phoneNumber} hideNumber />
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('sos.sectionShare')}</Text>
        <Text style={styles.sectionExplanation}>{t('sos.sectionShareExplanation')}</Text>
        <ShareLinkAction hike={hike} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontFamily: fontFamily.serif,
    fontSize: fontSize.large,
    color: semanticColors.textPrimary,
    marginBottom: 12,
  },
  sectionTitleHint: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    color: semanticColors.textSecondary,
  },
  emptyHint: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    color: semanticColors.textSecondary,
  },
  sectionExplanation: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    color: semanticColors.textSecondary,
    marginBottom: 12,
  },
});
