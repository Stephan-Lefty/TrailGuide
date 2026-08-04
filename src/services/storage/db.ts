import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

/**
 * expo-sqlite braucht im Web SharedArrayBuffer/Cross-Origin-Isolation-Header,
 * die der Standard-Expo-Webdev-Server nicht setzt. Web ist ohnehin keine
 * Zielplattform dieser App - Repositories weichen hier auf einen leeren
 * Zustand statt eines Absturzes aus, damit die Web-Vorschau für UI-Checks
 * trotzdem nutzbar bleibt.
 */
export const isSqliteSupported = Platform.OS !== 'web';

let dbInstance: SQLite.SQLiteDatabase | null = null;

const MIGRATIONS: string[] = [
  `CREATE TABLE IF NOT EXISTS saved_contacts (
    id TEXT PRIMARY KEY NOT NULL,
    label TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    scope TEXT NOT NULL DEFAULT 'permanent',
    hike_id TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS hikes (
    id TEXT PRIMARY KEY NOT NULL,
    started_at INTEGER NOT NULL,
    ended_at INTEGER,
    status TEXT NOT NULL DEFAULT 'active',
    share_token TEXT,
    share_expires_at INTEGER
  );`,
  `CREATE TABLE IF NOT EXISTS track_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hike_id TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    accuracy REAL,
    recorded_at INTEGER NOT NULL
  );`,
  `CREATE INDEX IF NOT EXISTS idx_track_points_hike_id ON track_points (hike_id);`,
];

export function getDb(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('naturlust_trail_guide.db');
    for (const statement of MIGRATIONS) {
      dbInstance.execSync(statement);
    }
  }
  return dbInstance;
}

/** Leert alle Tabellen - Kern des "App zurücksetzen"-Buttons in den Einstellungen. */
export function resetDatabase(): void {
  if (!isSqliteSupported) return;
  const db = getDb();
  db.execSync('DELETE FROM track_points; DELETE FROM hikes; DELETE FROM saved_contacts;');
}
