import { useCallback, useState } from 'react';

import { detectCountry, type CountryMatch } from '../services/country/countryLookupService';
import type { Coordinates } from '../types/location';

interface UseCurrentCountryResult {
  country: CountryMatch | null;
  detectFrom: (coords: Coordinates) => CountryMatch | null;
}

export function useCurrentCountry(): UseCurrentCountryResult {
  const [country, setCountry] = useState<CountryMatch | null>(null);

  const detectFrom = useCallback((coords: Coordinates) => {
    const match = detectCountry(coords);
    setCountry(match);
    return match;
  }, []);

  return { country, detectFrom };
}
