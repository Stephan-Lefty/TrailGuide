import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

import { detectCountry } from '../services/country/countryLookupService';

export interface LiveLocationState {
  countryCode: string | null;
  countryName: string | null;
  accuracyMeters: number | null;
  lastUpdatedAt: number | null;
  permissionDenied: boolean;
}

/**
 * Liefert waehrend einer aktiven Wanderung laufend den aktuellen Standort
 * (Vordergrund-Tracking). Dient hier zunaechst als sichtbare Rueckmeldung
 * fuer den Nutzer ("bin ich korrekt lokalisiert?") - die eigentliche
 * Hintergrund-Aufzeichnung der Tour folgt als naechster Schritt.
 */
export function useLiveLocation(enabled: boolean): LiveLocationState {
  const [state, setState] = useState<LiveLocationState>({
    countryCode: null,
    countryName: null,
    accuracyMeters: null,
    lastUpdatedAt: null,
    permissionDenied: false,
  });
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!enabled) {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      setState({
        countryCode: null,
        countryName: null,
        accuracyMeters: null,
        lastUpdatedAt: null,
        permissionDenied: false,
      });
      return;
    }

    let cancelled = false;

    async function start() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!cancelled) setState((prev) => ({ ...prev, permissionDenied: true }));
        return;
      }

      subscriptionRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 15000, distanceInterval: 20 },
        (position) => {
          if (cancelled) return;
          const match = detectCountry({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setState({
            countryCode: match?.iso2 ?? null,
            countryName: match?.name ?? null,
            accuracyMeters: position.coords.accuracy ?? null,
            lastUpdatedAt: position.timestamp,
            permissionDenied: false,
          });
        },
      );
    }

    start();

    return () => {
      cancelled = true;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, [enabled]);

  return state;
}
