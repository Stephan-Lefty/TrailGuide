export interface TrackedLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

export interface TrackEntry {
  location: TrackedLocation | null;
  /** Fester Ablaufzeitpunkt (ms seit Epoch), gesetzt bei Link-Erstellung - verlaengert sich NICHT durch Updates. */
  expiresAt: number;
}

function keyFor(token: string): string {
  return `track:${token}`;
}

export async function createTrackEntry(
  kv: KVNamespace,
  token: string,
  ttlMinutes: number,
): Promise<TrackEntry> {
  const expiresAt = Date.now() + ttlMinutes * 60_000;
  const entry: TrackEntry = { location: null, expiresAt };
  await kv.put(keyFor(token), JSON.stringify(entry), {
    expirationTtl: Math.max(60, ttlMinutes * 60),
  });
  return entry;
}

/** Liefert null, wenn der Token nicht existiert ODER die feste Ablaufzeit ueberschritten ist. */
export async function getTrackEntry(kv: KVNamespace, token: string): Promise<TrackEntry | null> {
  const raw = await kv.get(keyFor(token));
  if (!raw) return null;
  const entry = JSON.parse(raw) as TrackEntry;
  if (Date.now() > entry.expiresAt) return null;
  return entry;
}

/**
 * Aktualisiert nur den Standort, nicht die Ablaufzeit - ein "Live-Link" darf
 * nicht durch fortlaufende Updates unbegrenzt am Leben gehalten werden.
 */
export async function updateTrackLocation(
  kv: KVNamespace,
  token: string,
  location: TrackedLocation,
): Promise<TrackEntry | null> {
  const existing = await getTrackEntry(kv, token);
  if (!existing) return null;
  const updated: TrackEntry = { ...existing, location };
  const remainingSeconds = Math.max(60, Math.ceil((existing.expiresAt - Date.now()) / 1000));
  await kv.put(keyFor(token), JSON.stringify(updated), { expirationTtl: remainingSeconds });
  return updated;
}

export async function deleteTrackEntry(kv: KVNamespace, token: string): Promise<void> {
  await kv.delete(keyFor(token));
}
