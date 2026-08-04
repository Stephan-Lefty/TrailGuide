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

export async function revokeTrackLink(token: string): Promise<void> {
  try {
    await fetch(`${RELAY_BASE_URL}/api/track/${token}/revoke`, { method: 'POST' });
  } catch {
    // Revoke ist best-effort: der Token laeuft ohnehin spaetestens zur festen Ablaufzeit ab.
  }
}
