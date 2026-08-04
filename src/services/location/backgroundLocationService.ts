import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { getActiveHike } from '../hike/hikeRepository';
import { addTrackPoint } from '../hike/trackPointsRepository';
import { pushTrackLocation } from '../sharing/relayApiClient';

export const BACKGROUND_LOCATION_TASK = 'ntg-background-location-task';

interface LocationTaskData {
  locations: Location.LocationObject[];
}

/**
 * Muss beim Modul-Laden (top-level) registriert werden, nicht erst beim
 * Start einer Wanderung - sonst kann Android die Task nach einem
 * Prozess-Neustart im Hintergrund nicht wiederfinden. Welche Wanderung
 * gerade aktiv ist, wird bei jedem Aufruf frisch aus SQLite gelesen (nicht
 * aus einer In-Memory-Variable), damit das auch nach einem vollstaendigen
 * Neustart des App-Prozesses durch das Betriebssystem korrekt funktioniert.
 */
TaskManager.defineTask<LocationTaskData>(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error || !data) return;

  const activeHike = getActiveHike();
  if (!activeHike) return;

  const hasActiveShare = Boolean(activeHike.shareToken) && (activeHike.shareExpiresAt ?? 0) > Date.now();

  for (const location of data.locations) {
    addTrackPoint(activeHike.id, {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp,
    });

    if (hasActiveShare && activeHike.shareToken) {
      // Best-effort: ein einzelner fehlgeschlagener Push (z.B. kein Netz) darf
      // die lokale Aufzeichnung nicht unterbrechen, daher kein await-Fehlerabbruch.
      await pushTrackLocation(activeHike.shareToken, {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      });
    }
  }
});

export async function isBackgroundLocationTaskRunning(): Promise<boolean> {
  return TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
}

export interface StartTrackingResult {
  success: boolean;
  reason?: 'foreground_denied' | 'background_denied';
}

export async function startBackgroundLocationTracking(): Promise<StartTrackingResult> {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== 'granted') {
    return { success: false, reason: 'foreground_denied' };
  }

  const background = await Location.requestBackgroundPermissionsAsync();
  if (background.status !== 'granted') {
    return { success: false, reason: 'background_denied' };
  }

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: 30000,
    distanceInterval: 25,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'NaturlustTrailGuide',
      notificationBody: 'Standort wird waehrend deiner Aktivitaet erfasst.',
    },
  });

  return { success: true };
}

export async function stopBackgroundLocationTracking(): Promise<void> {
  const isRunning = await isBackgroundLocationTaskRunning();
  if (isRunning) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
}
