import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { getActiveHike } from '../hike/hikeRepository';
import { addTrackPoint, getLastTrackPointTime } from '../hike/trackPointsRepository';
import { pushTrackLocation } from '../sharing/relayApiClient';
import { isUsableFix } from './locationQuality';

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
  let lastRecordedAt = getLastTrackPointTime(activeHike.id);

  for (const location of data.locations) {
    // Verworfene Punkte werden auch nicht an den Live-Link geschickt - sonst
    // wuerde ein Verfolger genau die Spruenge sehen, die hier aussortiert werden.
    if (!isUsableFix(location.coords.accuracy, location.timestamp, lastRecordedAt)) {
      continue;
    }
    lastRecordedAt = location.timestamp;

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

/**
 * TaskManager.isTaskRegisteredAsync() prueft nur, ob der Task-TYP definiert
 * ist (das ist ab dem Modul-Laden immer der Fall) - nicht, ob gerade aktiv
 * Standort-Updates angefordert werden. Fuer letzteres liefert expo-location
 * eine eigene, dafuer gedachte Funktion.
 */
export async function isBackgroundLocationTaskRunning(): Promise<boolean> {
  return Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
}

export interface StartTrackingResult {
  success: boolean;
  reason?: 'foreground_denied' | 'background_denied';
}

/**
 * Prueft nur, ohne zu fragen - fuer den Start-Bildschirm, der beim Oeffnen
 * entscheiden muss, ob er zuerst um die Berechtigung bittet oder direkt den
 * Start anbietet.
 */
export async function hasBackgroundLocationPermission(): Promise<boolean> {
  const foreground = await Location.getForegroundPermissionsAsync();
  if (foreground.status !== 'granted') return false;
  const background = await Location.getBackgroundPermissionsAsync();
  return background.status === 'granted';
}

/**
 * Fordert beide Berechtigungen an, ohne schon etwas aufzuzeichnen.
 *
 * Bewusst getrennt vom eigentlichen Start: requestBackgroundPermissionsAsync()
 * oeffnet auf Android 11+ keinen Dialog, sondern eine eigene Systemseite. Die
 * App wird dabei pausiert und kann von Android abgeraeumt werden - Code, der
 * nach dem await noch etwas erledigen will, laeuft dann womoeglich nie. Deshalb
 * darf vorher nichts angelegt worden sein, was aufgeraeumt werden muesste.
 */
export async function requestLocationPermissions(): Promise<StartTrackingResult> {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== 'granted') {
    return { success: false, reason: 'foreground_denied' };
  }

  const background = await Location.requestBackgroundPermissionsAsync();
  if (background.status !== 'granted') {
    return { success: false, reason: 'background_denied' };
  }

  return { success: true };
}

/**
 * Startet die Standort-Updates. Setzt voraus, dass die Berechtigung bereits
 * erteilt ist - prueft das, fragt aber bewusst nicht nach: Ein Dialog oder gar
 * ein Sprung in die Systemeinstellungen waehrend des Startvorgangs pausiert die
 * App und hat genau die Doppelstarts verursacht, die wir loswerden wollen.
 * Wer die Berechtigung noch einholen muss, ruft vorher requestLocationPermissions().
 */
export async function startBackgroundLocationTracking(): Promise<StartTrackingResult> {
  if (!(await hasBackgroundLocationPermission())) {
    return { success: false, reason: 'background_denied' };
  }

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    // 10 Sekunden statt der frueheren 30. Die Radtour vom 29.09.2026 hat
    // gezeigt, dass 30 Sekunden bei Radgeschwindigkeit rund 7 % der Strecke
    // verschlucken: zwischen zwei Punkten liegen dann ueber 150 Meter, und
    // jede Kurve dazwischen wird zur Gerade. Derselbe Referenztrack auf
    // 10-Sekunden-Abstand ausgeduennt verliert nur noch 2,8 %.
    timeInterval: 10000,
    distanceInterval: 10,
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
