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
  /**
   * Es darf immer nur genau eine Aktivitaet aktiv sein. Bis Version 1.0.0
   * konnte eine zweite entstehen: createHike() legte die Zeile an, BEVOR die
   * Standort-Berechtigung abgefragt wurde. Kam der Nutzer aus der
   * Android-Berechtigungsseite zurueck und tippte erneut auf "Starten", gab es
   * zwei Zeilen mit status='active'. Die aeltere wurde unsichtbar (getActiveHike
   * nimmt nur die neueste) und alle weiteren GPS-Punkte wanderten in die
   * neuere - die erste Tour brach damit scheinbar mitten im Lauf ab.
   *
   * Solche Altlasten muessen geschlossen werden, bevor der Index angelegt
   * werden kann - sonst weist SQLite ihn zurueck. Sie werden als Vorfall
   * markiert statt geloescht: die Punkte sind moeglicherweise die einzige Spur
   * einer echten Tour. Entfernen kann der Nutzer sie in "Meine Aktivitaeten".
   * Als Endzeit dient der letzte aufgezeichnete Punkt, nicht der Zeitpunkt der
   * Migration - sonst stuende dort eine Dauer, die es nie gab.
   */
  `UPDATE hikes SET
     status = 'ended_incident',
     ended_at = COALESCE(
       (SELECT MAX(recorded_at) FROM track_points WHERE track_points.hike_id = hikes.id),
       started_at
     )
   WHERE status = 'active'
     AND id <> (SELECT id FROM hikes WHERE status = 'active' ORDER BY started_at DESC LIMIT 1);`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_hikes_single_active
     ON hikes (status) WHERE status = 'active';`,
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
