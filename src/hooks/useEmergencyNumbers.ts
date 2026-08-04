import { useMemo } from 'react';

import { getEmergencyNumbersForCountry, UNIVERSAL_EMERGENCY_NUMBER } from '../services/country/countryEmergencyNumbers';
import type { EmergencyNumberEntry } from '../types/emergencyNumber';

interface UseEmergencyNumbersResult {
  universal: typeof UNIVERSAL_EMERGENCY_NUMBER;
  countryEntry: EmergencyNumberEntry | null;
}

export function useEmergencyNumbers(countryCode: string | null): UseEmergencyNumbersResult {
  const countryEntry = useMemo(() => getEmergencyNumbersForCountry(countryCode), [countryCode]);

  return { universal: UNIVERSAL_EMERGENCY_NUMBER, countryEntry };
}
