import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { countryEmergencyNumbers, MANUALLY_SELECTABLE_COUNTRY_CODES } from '../../services/country/countryEmergencyNumbers';
import { semanticColors } from '../../theme/colors';
import { fontFamily, fontSize, radius } from '../../theme/typography';

interface CountrySelectorProps {
  /** null = automatische Erkennung wird verwendet. */
  selectedCountryCode: string | null;
  onSelect: (countryCode: string | null) => void;
}

/**
 * Erlaubt es, die automatische Standort-basierte Laendererkennung bewusst zu
 * uebersteuern - z.B. im Dreilaendereck AT/CH/DE, wenn gezielt die
 * oesterreichische Bergrettung statt der (evtl. falsch erkannten) Nachbarn
 * erreicht werden soll.
 */
export function CountrySelector({ selectedCountryCode, onSelect }: CountrySelectorProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onSelect(null)}
        style={[styles.chip, selectedCountryCode === null && styles.chipActive]}
      >
        <Text style={[styles.chipText, selectedCountryCode === null && styles.chipTextActive]}>
          {t('sos.chooseCountryAuto')}
        </Text>
      </Pressable>
      {countryEmergencyNumbers
        .filter((entry) => MANUALLY_SELECTABLE_COUNTRY_CODES.includes(entry.countryCode))
        .map((entry) => {
        const active = selectedCountryCode === entry.countryCode;
        return (
          <Pressable
            key={entry.countryCode}
            onPress={() => onSelect(entry.countryCode)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {t(`countries.${entry.countryCode}`, { defaultValue: entry.countryName })}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    backgroundColor: semanticColors.surface,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipActive: {
    backgroundColor: semanticColors.primary,
  },
  chipText: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    fontWeight: '600',
    color: semanticColors.textPrimary,
  },
  chipTextActive: {
    color: '#ffffff',
  },
});
