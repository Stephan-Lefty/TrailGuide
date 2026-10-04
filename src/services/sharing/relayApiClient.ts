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

/**
 * So lange darf das Anlegen eines Live-Links hoechstens brauchen.
 *
 * Anders als beim Widerruf wartet hier jemand zu - der Knopf zeigt
 * "Wird gestartet...". Ohne Limit dreht er sich endlos: Beim Geraetetest am
 * 04.10.2026 stand er wegen des bei REVOKE_TIMEOUT_MS beschriebenen
 * IPv6-Problems **fuenf Minuten** so da, ohne Rueckmeldung und ohne
 * Abbruchmoeglichkeit. Der Link war am Ende sogar angelegt worden, nur hatte
 * das niemand mehr mitbekommen.
 *
 * Nach dieser Zeit gilt der Versuch als gescheitert und der Knopf wird wieder
 * bedienbar. Das ist die ehrlichere Antwort als ein Rad, das sich dreht: Wer
 * es noch einmal versucht, hat gute Aussichten, weil die Verbindung dann in
 * der Regel steht - die laufenden Standort-Uebertragungen liefen auf demselben
 * Netz anschliessend ohne Auffaelligkeit.
 */
export const CREATE_TIMEOUT_MS = 20_000;

export async function createTrackLink(ttlMinutes: number): Promise<CreateLinkResponse> {
  const abbruch = new AbortController();
  const wecker = setTimeout(() => abbruch.abort(), CREATE_TIMEOUT_MS);
  try {
    const res = await fetch(`${RELAY_BASE_URL}/api/track/new`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ttlMinutes }),
      signal: abbruch.signal,
    });
    if (!res.ok) {
      throw new Error(`relay_create_failed: ${res.status}`);
    }
    return await res.json();
  } finally {
    clearTimeout(wecker);
  }
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

/**
 * So lange darf der Widerruf hoechstens brauchen.
 *
 * Grosszuegig bemessen, weil er **niemanden warten laesst**: Die Oberflaeche
 * vergisst den Link sofort und schickt den Widerruf nebenher los. Ein knappes
 * Limit waere hier genau verkehrt - es wuergt den Widerruf ab, ohne irgendwem
 * Zeit zu sparen.
 *
 * Der Wert stand zunaechst bei 5 Sekunden. Der Geraetetest am 04.10.2026 hat
 * vorgefuehrt, warum das zu wenig ist: Im WLAN des Testgeraets bewarb der
 * Router IPv6 als benutzbar - eine globale Adresse war da -, aber TCP darueber
 * lief ins Leere, waehrend IPv4 sofort verband. Android versucht deshalb
 * zuerst IPv6 und faellt erst nach dem TCP-Timeout zurueck; der erste Aufruf
 * brauchte dadurch fuenf Minuten. Nach 5 Sekunden abzubrechen hiess schlicht:
 * Der Widerruf kam nie an, und der Token lebte weiter.
 *
 * Wichtig fuer die Einordnung: Betroffen war das Heim-WLAN. Auf der Radtour
 * desselben Tages, unterwegs ueber Mobilfunk, funktionierte der Live-Link.
 */
export const REVOKE_TIMEOUT_MS = 30_000;

/**
 * Widerruft einen Live-Link. Wirft nie.
 *
 * Der Aufrufer soll das Ergebnis **nicht abwarten muessen** - siehe
 * stopLiveShare. Scheitert der Widerruf, bleibt die feste Ablaufzeit des
 * Tokens als Rueckfallebene.
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
