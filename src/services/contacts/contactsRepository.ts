import { randomUUID } from 'expo-crypto';

import { getDb, isSqliteSupported } from '../storage/db';
import { MAX_PERMANENT_CONTACTS, type ContactScope, type SavedContact } from '../../types/emergencyNumber';

interface SavedContactRow {
  id: string;
  label: string;
  phone_number: string;
  sort_order: number;
  scope: ContactScope;
  hike_id: string | null;
}

function toSavedContact(row: SavedContactRow): SavedContact {
  return {
    id: row.id,
    label: row.label,
    phoneNumber: row.phone_number,
    sortOrder: row.sort_order,
    scope: row.scope,
    hikeId: row.hike_id,
  };
}

/** Alle dauerhaften Kontakte, sortiert nach Prioritaet (sortOrder aufsteigend). */
export async function listPermanentContacts(): Promise<SavedContact[]> {
  if (!isSqliteSupported) return [];
  const db = getDb();
  const rows = db.getAllSync<SavedContactRow>(
    "SELECT * FROM saved_contacts WHERE scope = 'permanent' ORDER BY sort_order ASC",
  );
  return rows.map(toSavedContact);
}

/** Dauerhafte Kontakte plus - falls vorhanden - der Tour-Kontakt der aktiven Wanderung. */
export async function listContactsForHike(hikeId: string | null): Promise<SavedContact[]> {
  if (!isSqliteSupported) return [];
  const db = getDb();
  const rows = hikeId
    ? db.getAllSync<SavedContactRow>(
        "SELECT * FROM saved_contacts WHERE scope = 'permanent' OR (scope = 'tour' AND hike_id = ?) ORDER BY scope DESC, sort_order ASC",
        hikeId,
      )
    : db.getAllSync<SavedContactRow>("SELECT * FROM saved_contacts WHERE scope = 'permanent' ORDER BY sort_order ASC");
  return rows.map(toSavedContact);
}

/**
 * Legt einen dauerhaften Kontakt an. Es sind maximal MAX_PERMANENT_CONTACTS (2)
 * erlaubt - die Begrenzung wird hier durchgesetzt, nicht nur in der UI.
 */
export async function addPermanentContact(label: string, phoneNumber: string): Promise<SavedContact> {
  if (!isSqliteSupported) {
    return { id: randomUUID(), label, phoneNumber, sortOrder: 0, scope: 'permanent', hikeId: null };
  }
  const db = getDb();

  const existing = db.getAllSync<{ count: number }>(
    "SELECT COUNT(*) as count FROM saved_contacts WHERE scope = 'permanent'",
  );
  if ((existing[0]?.count ?? 0) >= MAX_PERMANENT_CONTACTS) {
    throw new Error(`Es koennen maximal ${MAX_PERMANENT_CONTACTS} dauerhafte Kontakte gespeichert werden.`);
  }

  const maxOrderRow = db.getAllSync<{ maxOrder: number | null }>(
    "SELECT MAX(sort_order) as maxOrder FROM saved_contacts WHERE scope = 'permanent'",
  );
  const nextOrder = (maxOrderRow[0]?.maxOrder ?? -1) + 1;
  const id = randomUUID();
  db.runSync(
    'INSERT INTO saved_contacts (id, label, phone_number, sort_order, scope, hike_id) VALUES (?, ?, ?, ?, ?, NULL)',
    id,
    label,
    phoneNumber,
    nextOrder,
    'permanent' satisfies ContactScope,
  );
  return { id, label, phoneNumber, sortOrder: nextOrder, scope: 'permanent', hikeId: null };
}

/**
 * Setzt den einen zusaetzlichen Kontakt fuer die aktuelle Tour (4. Kontakt).
 * Ein evtl. vorhandener Tour-Kontakt derselben Wanderung wird ersetzt.
 */
export async function setTourContact(hikeId: string, label: string, phoneNumber: string): Promise<SavedContact> {
  if (!isSqliteSupported) {
    return { id: randomUUID(), label, phoneNumber, sortOrder: 0, scope: 'tour', hikeId };
  }
  const db = getDb();

  db.runSync("DELETE FROM saved_contacts WHERE scope = 'tour' AND hike_id = ?", hikeId);
  const id = randomUUID();
  db.runSync(
    'INSERT INTO saved_contacts (id, label, phone_number, sort_order, scope, hike_id) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    label,
    phoneNumber,
    0,
    'tour' satisfies ContactScope,
    hikeId,
  );
  return { id, label, phoneNumber, sortOrder: 0, scope: 'tour', hikeId };
}

/** Entfernt den Tour-Kontakt einer Wanderung. Wird beim Beenden der Tour automatisch aufgerufen. */
export async function clearTourContact(hikeId: string): Promise<void> {
  if (!isSqliteSupported) return;
  const db = getDb();
  db.runSync("DELETE FROM saved_contacts WHERE scope = 'tour' AND hike_id = ?", hikeId);
}

/** Aktualisiert Name und Telefonnummer eines bestehenden dauerhaften Kontakts. */
export async function updatePermanentContact(id: string, label: string, phoneNumber: string): Promise<void> {
  if (!isSqliteSupported) return;
  const db = getDb();
  db.runSync('UPDATE saved_contacts SET label = ?, phone_number = ? WHERE id = ?', label, phoneNumber, id);
}

export async function removeContact(id: string): Promise<void> {
  if (!isSqliteSupported) return;
  const db = getDb();
  db.runSync('DELETE FROM saved_contacts WHERE id = ?', id);
}

/** Setzt die Prioritaets-Reihenfolge der dauerhaften Kontakte neu (Index 0 = hoechste Prioritaet). */
export async function reorderPermanentContacts(orderedIds: string[]): Promise<void> {
  if (!isSqliteSupported) return;
  const db = getDb();
  orderedIds.forEach((id, index) => {
    db.runSync('UPDATE saved_contacts SET sort_order = ? WHERE id = ?', index, id);
  });
}
