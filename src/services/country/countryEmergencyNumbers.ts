import type { EmergencyNumberEntry } from '../../types/emergencyNumber';

/** Europaweite Notrufnummer, wird IMMER angezeigt, unabhängig von der Ländererkennung. */
export const UNIVERSAL_EMERGENCY_NUMBER = { label: '112', number: '112' };

/**
 * Zusätzliche, landesspezifische Notrufnummern. Nur Länder mit einer echten
 * eigenen Bergrettungs-/Alpin-Nummer sind hier gelistet - alle anderen Länder
 * zeigen ausschließlich die 112 (siehe UNIVERSAL_EMERGENCY_NUMBER).
 *
 * WICHTIG: Vor jedem Release gegen aktuelle offizielle Quellen prüfen
 * (lastVerified aktualisieren). Falsche Nummern in einer Sicherheits-App
 * sind ein echtes Risiko.
 */
export const countryEmergencyNumbers: EmergencyNumberEntry[] = [
  {
    countryCode: 'AT',
    countryName: 'Österreich',
    numbers: [{ label: 'Bergrettung', number: '140' }],
    lastVerified: '2026-08-04',
  },
  {
    countryCode: 'CH',
    countryName: 'Schweiz',
    numbers: [{ label: 'Rega (Alpine Luftrettung)', number: '1414' }],
    lastVerified: '2026-08-04',
  },
  {
    countryCode: 'SK',
    countryName: 'Slowakei',
    numbers: [{ label: 'Horská záchranná služba', number: '18300' }],
    lastVerified: '2026-08-04',
  },
  {
    countryCode: 'PL',
    countryName: 'Polen',
    numbers: [{ label: 'GOPR/TOPR Bergrettung', number: '601100300' }],
    lastVerified: '2026-08-04',
  },
  {
    countryCode: 'CZ',
    countryName: 'Tschechien',
    numbers: [{ label: 'Horská služba', number: '1210' }],
    lastVerified: '2026-08-04',
  },
  {
    countryCode: 'IT',
    countryName: 'Italien',
    numbers: [{ label: 'CNSAS Bergrettung (118)', number: '118' }],
    lastVerified: '2026-08-04',
  },
  {
    countryCode: 'ES',
    countryName: 'Spanien',
    numbers: [{ label: 'Guardia Civil (Bergrettung)', number: '062' }],
    lastVerified: '2026-08-04',
  },
  {
    countryCode: 'BG',
    countryName: 'Bulgarien',
    numbers: [{ label: 'Planinska Spasitelna Sluzhba (Bergrettung)', number: '1470' }],
    lastVerified: '2026-08-04',
  },
];

/**
 * Nur diese Laender stehen im manuellen "Anderes Land waehlen"-Umschalter
 * zur Auswahl (Grenzregion AT/CH/DE - der urspruengliche Anwendungsfall).
 * Die vollstaendige Liste oben wird trotzdem fuer die automatische
 * GPS-basierte Erkennung in allen Laendern verwendet.
 */
export const MANUALLY_SELECTABLE_COUNTRY_CODES = ['AT', 'CH'];

export function getEmergencyNumbersForCountry(countryCode: string | null): EmergencyNumberEntry | null {
  if (!countryCode) return null;
  return countryEmergencyNumbers.find((entry) => entry.countryCode === countryCode) ?? null;
}
