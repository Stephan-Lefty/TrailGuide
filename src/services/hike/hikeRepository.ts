import { randomUUID } from 'expo-crypto';

import { getDb, isSqliteSupported } from '../storage/db';
import type { Hike, HikeStatus } from '../../types/hike';

interface HikeRow {
  id: string;
  started_at: number;
  ended_at: number | null;
  status: HikeStatus;
  share_token: string | null;
  share_expires_at: number | null;
}

function toHike(row: HikeRow): Hike {
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    status: row.status,
    shareToken: row.share_token,
    shareExpiresAt: row.share_expires_at,
  };
}

/**
 * Legt eine neue Aktivitaet an. Sollte wider Erwarten noch eine offene Zeile
 * existieren, wird sie in derselben Transaktion geschlossen - der Unique-Index
 * idx_hikes_single_active wuerde den INSERT sonst zurueckweisen und der Nutzer
 * koennte gar keine Aktivitaet mehr starten. Beides zusammen in einer
 * Transaktion, damit kein Zustand entstehen kann, in dem die alte geschlossen,
 * die neue aber nicht angelegt ist.
 */
export function createHike(): Hike {
  const id = randomUUID();
  const startedAt = Date.now();
  if (isSqliteSupported) {
    const db = getDb();
    db.withTransactionSync(() => {
      db.runSync(
        `UPDATE hikes SET
           status = 'ended_incident',
           ended_at = COALESCE(
             (SELECT MAX(recorded_at) FROM track_points WHERE track_points.hike_id = hikes.id),
             started_at
           )
         WHERE status = 'active'`,
      );
      db.runSync(
        'INSERT INTO hikes (id, started_at, status) VALUES (?, ?, ?)',
        id,
        startedAt,
        'active' satisfies HikeStatus,
      );
    });
  }
  return { id, startedAt, endedAt: null, status: 'active', shareToken: null, shareExpiresAt: null };
}

export function getActiveHike(): Hike | null {
  if (!isSqliteSupported) return null;
  const db = getDb();
  const rows = db.getAllSync<HikeRow>("SELECT * FROM hikes WHERE status = 'active' ORDER BY started_at DESC LIMIT 1");
  return rows[0] ? toHike(rows[0]) : null;
}

export function updateHikeStatus(id: string, status: HikeStatus, endedAt: number | null): void {
  if (!isSqliteSupported) return;
  const db = getDb();
  db.runSync('UPDATE hikes SET status = ?, ended_at = ? WHERE id = ?', status, endedAt, id);
}

export function setShareLink(id: string, shareToken: string | null, shareExpiresAt: number | null): void {
  if (!isSqliteSupported) return;
  const db = getDb();
  db.runSync('UPDATE hikes SET share_token = ?, share_expires_at = ? WHERE id = ?', shareToken, shareExpiresAt, id);
}

export function listPastHikes(): Hike[] {
  if (!isSqliteSupported) return [];
  const db = getDb();
  const rows = db.getAllSync<HikeRow>("SELECT * FROM hikes WHERE status != 'active' ORDER BY started_at DESC");
  return rows.map(toHike);
}
