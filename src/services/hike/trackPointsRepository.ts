import { getDb, isSqliteSupported } from '../storage/db';
import type { TrackPoint } from '../../types/location';

interface TrackPointRow {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  altitude_accuracy: number | null;
  recorded_at: number;
}

function toTrackPoint(row: TrackPointRow): TrackPoint {
  return {
    latitude: row.latitude,
    longitude: row.longitude,
    accuracy: row.accuracy,
    altitude: row.altitude,
    altitudeAccuracy: row.altitude_accuracy,
    timestamp: row.recorded_at,
  };
}

export function addTrackPoint(hikeId: string, point: TrackPoint): void {
  if (!isSqliteSupported) return;
  const db = getDb();
  db.runSync(
    'INSERT INTO track_points (hike_id, latitude, longitude, accuracy, altitude, altitude_accuracy, recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    hikeId,
    point.latitude,
    point.longitude,
    point.accuracy ?? null,
    point.altitude ?? null,
    point.altitudeAccuracy ?? null,
    point.timestamp,
  );
}

export function listTrackPoints(hikeId: string): TrackPoint[] {
  if (!isSqliteSupported) return [];
  const db = getDb();
  const rows = db.getAllSync<TrackPointRow>(
    'SELECT latitude, longitude, accuracy, altitude, altitude_accuracy, recorded_at FROM track_points WHERE hike_id = ? ORDER BY recorded_at ASC',
    hikeId,
  );
  return rows.map(toTrackPoint);
}

/**
 * Zeitstempel des zuletzt gespeicherten Punktes, oder null. Wird vom
 * Genauigkeitsfilter gebraucht, um zu erkennen, wie lange schon nichts mehr
 * aufgezeichnet wurde. Bewusst aus der Datenbank statt aus einer Variablen im
 * Speicher: der Hintergrund-Task laeuft auch nach einem Prozess-Neustart durch
 * Android weiter, dabei waere jeder In-Memory-Zustand verloren.
 */
export function getLastTrackPointTime(hikeId: string): number | null {
  if (!isSqliteSupported) return null;
  const db = getDb();
  const rows = db.getAllSync<{ last: number | null }>(
    'SELECT MAX(recorded_at) as last FROM track_points WHERE hike_id = ?',
    hikeId,
  );
  return rows[0]?.last ?? null;
}

/**
 * Der zuletzt gespeicherte Punkt, oder null.
 *
 * Der Plausibilitaetsfilter braucht nicht nur den Zeitstempel, sondern auch die
 * Koordinaten - er urteilt anhand der Geschwindigkeit zum letzten angenommenen
 * Punkt. Wie bei getLastTrackPointTime bewusst aus der Datenbank: Der
 * Hintergrund-Task ueberlebt einen Prozess-Neustart durch Android, ein Wert im
 * Speicher nicht.
 */
export function getLastTrackPoint(hikeId: string): TrackPoint | null {
  if (!isSqliteSupported) return null;
  const db = getDb();
  const rows = db.getAllSync<TrackPointRow>(
    'SELECT latitude, longitude, accuracy, altitude, altitude_accuracy, recorded_at FROM track_points WHERE hike_id = ? ORDER BY recorded_at DESC LIMIT 1',
    hikeId,
  );
  return rows[0] ? toTrackPoint(rows[0]) : null;
}

/**
 * Die zuletzt gespeicherten Punkte, aelteste zuerst.
 *
 * Fuer die Stillstandserkennung: Sie muss zurueckblicken, wie lange jemand
 * schon am selben Fleck ist, und das kann Stunden umfassen. Die ganze Tour zu
 * laden waere verschwenderisch - der Hintergrund-Task laeuft im Zehn-Sekunden-
 * Takt, und eine Tagestour hat mehrere tausend Punkte. Die Obergrenze deckelt
 * den Rueckblick: Bei einer echten Rast liefert Android nur alle ein bis zehn
 * Minuten einen Punkt, 500 reichen damit fuer viele Stunden.
 */
export function listRecentTrackPoints(hikeId: string, limit: number): TrackPoint[] {
  if (!isSqliteSupported) return [];
  const db = getDb();
  const rows = db.getAllSync<TrackPointRow>(
    'SELECT latitude, longitude, accuracy, altitude, altitude_accuracy, recorded_at FROM track_points WHERE hike_id = ? ORDER BY recorded_at DESC LIMIT ?',
    hikeId,
    limit,
  );
  return rows.map(toTrackPoint).reverse();
}

export function countTrackPoints(hikeId: string): number {
  if (!isSqliteSupported) return 0;
  const db = getDb();
  const rows = db.getAllSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM track_points WHERE hike_id = ?',
    hikeId,
  );
  return rows[0]?.count ?? 0;
}

/** Loescht alle Trackpunkte einer Wanderung - Kern der "Auto-Loeschung ohne Vorfall"-Regel. */
export function deleteTrackPoints(hikeId: string): void {
  if (!isSqliteSupported) return;
  const db = getDb();
  db.runSync('DELETE FROM track_points WHERE hike_id = ?', hikeId);
}
