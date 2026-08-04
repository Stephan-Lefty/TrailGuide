import { BackHandler, Platform } from 'react-native';

import { getActiveHike } from '../hike/hikeRepository';
import { stopBackgroundLocationTracking } from '../location/backgroundLocationService';
import { resetDatabase } from '../storage/db';
import { clearAllSettings } from '../storage/settingsStore';

/**
 * Setzt die App komplett auf den Auslieferungszustand zurueck: stoppt ein
 * evtl. laufendes Hintergrund-Tracking, loescht alle Wanderungen/Kontakte
 * aus der Datenbank sowie alle lokalen Einstellungen (inkl. Onboarding-Flag)
 * und beendet die App danach - beim naechsten Start landet man wieder im
 * Onboarding, genau wie bei einer frischen Installation.
 */
export async function factoryResetApp(): Promise<void> {
  if (getActiveHike()) {
    await stopBackgroundLocationTracking();
  }
  resetDatabase();
  clearAllSettings();

  if (Platform.OS === 'android') {
    BackHandler.exitApp();
  }
}
