import { getDb, isSqliteSupported } from '../storage/db';
import type { TrackPoint } from '../../types/location';

interface TrackPointRow {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  recorded_at: number;
}

function toTrackPoint(row: TrackPointRow): TrackPoint {
  return {
    latitude: row.latitude,
    longitude: row.longitude,
    accuracy: row.accuracy,
    timestamp: row.recorded_at,
  };
}

export function addTrackPoint(hikeId: string, point: TrackPoint): void {
  if (!isSqliteSupported) return;
  const db = getDb();
  db.runSync(
    'INSERT INTO track_points (hike_id, latitude, longitude, accuracy, recorded_at) VALUES (?, ?, ?, ?, ?)',
    hikeId,
    point.latitude,
    point.longitude,
    point.accuracy ?? null,
    point.timestamp,
  );
}

export function listTrackPoints(hikeId: string): TrackPoint[] {
  if (!isSqliteSupported) return [];
  const db = getDb();
  const rows = db.getAllSync<TrackPointRow>(
    'SELECT latitude, longitude, accuracy, recorded_at FROM track_points WHERE hike_id = ? ORDER BY recorded_at ASC',
    hikeId,
  );
  return rows.map(toTrackPoint);
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
