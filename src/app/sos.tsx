import { router } from 'expo-router';
import { useEffect } from 'react';

import { SosSheet } from '../components/sos/SosSheet';
import { getActiveHike } from '../services/hike/hikeRepository';

/**
 * Zweite Absicherung gegen versehentliche Notrufe: der SOS-Screen ist nur
 * erreichbar, wenn eine Wanderung aktiv ist. Der Button auf der Startseite
 * ist zwar bereits deaktiviert, aber diese Pruefung greift auch, falls der
 * Screen auf einem anderen Weg (z.B. Zurueck-Navigation) erreicht wird.
 */
export default function SosScreen() {
  useEffect(() => {
    if (!getActiveHike()) {
      router.replace('/');
    }
  }, []);

  return <SosSheet />;
}
