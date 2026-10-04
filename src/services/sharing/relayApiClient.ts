/**
 * Basis-URL des Cloudflare-Worker-Relays (server/). Ueber EXPO_PUBLIC_RELAY_API_URL
 * konfigurierbar. Der Fallback 10.0.2.2 ist die feste Adresse, unter der der
 * Android-Emulator den localhost-Rechner des Entwicklers erreicht - fuer den
 * lokalen `npm run dev` im server/-Ordner waehrend der Entwicklung. Fuer ein
 * echtes Geraet oder Produktion muss EXPO_PUBLIC_RELAY_API_URL auf die
 * tatsaechlich deployte Worker-URL gesetzt werden.
 */
const RELAY_BASE_URL = process.env.EXPO_PUBLIC_RELAY_API_URL ?? 'http://10.0.2.2:8788';

export interface CreateLinkResponse {
  token: string;
  viewUrl: string;
  expiresAt: number;
}

export interface RelayLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
  /**
   * Seit wann sich die Person nicht mehr von der Stelle bewegt, oder null.
   * Seit 1.0.4 - damit ein Verfolger "macht Pause" von "Telefon tot"
   * unterscheiden kann. Siehe standstill.ts.
   */
  stationarySince?: number | null;
}

export async function createTrackLink(ttlMinutes: number): Promise<CreateLinkResponse> {
  const res = await fetch(`${RELAY_BASE_URL}/api/track/new`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ttlMinutes }),
  });
  if (!res.ok) {
    throw new Error(`relay_create_failed: ${res.status}`);
  }
  return res.json();
}

/** Gibt false zurueck (statt zu werfen), wenn der Push fehlschlaegt - ein einzelner verlorener Punkt soll das Tracking nicht unterbrechen. */
export async function pushTrackLocation(token: string, location: RelayLocation): Promise<boolean> {
  try {
    const res = await fetch(`${RELAY_BASE_URL}/api/track/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(location),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * So lange wird hoechstens auf den Widerruf gewartet.
 *
 * Seit 1.0.5 wird der Live-Link beim Beenden einer Aktivitaet widerrufen - und
 * damit haengt dieser Aufruf im Weg des Nutzers, der gerade "Aktivitaet
 * beenden" getippt hat. Ohne Zeitlimit wartet `fetch` am Ende einer Bergtour
 * ohne Netz unter Umstaenden eine Minute oder laenger, und solange stuende die
 * App. Lieber ein nicht widerrufener Token - dessen feste Ablaufzeit greift
 * ohnehin - als eine App, die sich beim Beenden aufhaengt.
 */
/**
 * Die Adresse, unter der ein Token zu sehen ist.
 *
 * Normalerweise kommt sie beim Anlegen vom Relay zurueck. Gespeichert wird sie
 * aber nicht - in der Datenbank steht nur der Token. Wer einen laufenden Link
 * aus einer frueheren Sitzung wiederfindet, braucht sie trotzdem, sonst steht
 * in der App ein aktiver Link ohne Adresse und ohne Abschalt-Knopf.
 */
export function buildViewUrl(token: string): string {
  return `${RELAY_BASE_URL}/view/${token}`;
}

export const REVOKE_TIMEOUT_MS = 5000;

/**
 * Widerruft einen Live-Link. Wirft nie und wartet hoechstens
 * REVOKE_TIMEOUT_MS - beides, weil der Aufrufer im Beenden-Pfad steht.
 */
export async function revokeTrackLink(token: string): Promise<boolean> {
  const abbruch = new AbortController();
  const wecker = setTimeout(() => abbruch.abort(), REVOKE_TIMEOUT_MS);
  try {
    const res = await fetch(`${RELAY_BASE_URL}/api/track/${token}/revoke`, {
      method: 'POST',
      signal: abbruch.signal,
    });
    return res.ok;
  } catch {
    // Best-effort: der Token laeuft spaetestens zur festen Ablaufzeit ab.
    return false;
  } finally {
    clearTimeout(wecker);
  }
}
