/**
 * Begrenzung fuer das Anlegen neuer Live-Links.
 *
 * Warum ueberhaupt: `POST /api/track/new` legt ohne Anmeldung einen Eintrag im
 * KV-Speicher an. Die Adresse des Relays steckt im Klartext in der App - am
 * 05.10.2026 am gebauten Paket nachgeprueft -, und sobald die APK direkt von
 * naturlust.net herunterladbar ist, kann sie jeder auslesen. Ohne Begrenzung
 * koennte damit jeder beliebig viele Eintraege auf Stephans Cloudflare-Konto
 * erzeugen.
 *
 * ## Was diese Begrenzung leistet - und was nicht
 *
 * Sie haelt gelegentlichen Missbrauch und Versehen auf (ein Skript in einer
 * Schleife, ein hangengebliebener Client). Sie haelt **keinen** entschlossenen
 * Angreifer auf, der ueber viele Adressen verteilt anfragt. Das ist eine
 * bewusste Entscheidung, siehe unten.
 *
 * Zwei bauartbedingte Unschaerfen, beide hier benannt statt verschwiegen:
 *
 * - **Workers KV ist nur letztlich konsistent.** Zwei Anfragen, die in
 *   verschiedenen Rechenzentren fast gleichzeitig ankommen, sehen
 *   moeglicherweise denselben alten Zaehlerstand. Ein kurzer Stoss kann das
 *   Limit also ueberschreiten. Fuer die Aufgabe - das Kontingent schuetzen -
 *   genuegt das. Exakt waere nur ein Durable Object, und das waere fuer eine
 *   Handvoll Links am Tag Aufwand ohne Gegenwert.
 * - **Festes Zeitfenster, kein gleitendes.** Direkt an einer Fenstergrenze
 *   sind im aergsten Fall doppelt so viele Anfragen moeglich wie das Limit
 *   nennt. Ebenfalls hinnehmbar.
 *
 * ## Kein globales Limit - mit Absicht
 *
 * Naheliegend waere eine zweite Schranke ueber alle Anfragen hinweg, als
 * Rueckfallebene fuer das Kontingent. Die ist hier bewusst **nicht** gebaut:
 * Sie liesse sich von aussen auslosen, und dann koennte jemand, der gerade in
 * den Bergen Hilfe braucht, keinen Live-Link mehr anlegen. Bei einer
 * Notfall-App ist eine Cloudflare-Rechnung das kleinere Uebel als ein
 * blockierter Notruf-Weg.
 */

/** Hoechstens so viele neue Links pro Adresse und Zeitfenster. */
export const CREATE_LIMIT_PER_WINDOW = 10;

/** Laenge des Zeitfensters in Sekunden. */
export const CREATE_WINDOW_SECONDS = 3600;

/**
 * Schluessel fuer Anfragen ohne erkennbare Adresse.
 *
 * Cloudflare setzt `CF-Connecting-IP` zuverlaessig; fehlt der Kopf trotzdem
 * (lokaler `wrangler dev`, kuenftige Aenderungen), landen diese Anfragen in
 * einem gemeinsamen Eimer. Lieber gemeinsam begrenzt als unbegrenzt - sonst
 * waere das Weglassen des Kopfes der Weg um die Begrenzung herum.
 */
export const UNBEKANNTE_ADRESSE = 'unbekannt';

export interface RateLimitErgebnis {
  erlaubt: boolean;
  /** Stand *nach* dieser Anfrage, wenn sie erlaubt war - sonst der unveraenderte Stand. */
  stand: number;
  /** Sekunden bis zum naechsten Zeitfenster. Nur bei erlaubt === false sinnvoll. */
  wartenSekunden: number;
}

/** Nur der Teil von KVNamespace, den die Begrenzung braucht - macht sie testbar. */
export interface ZaehlerSpeicher {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export function adresseAusAnfrage(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ?? UNBEKANNTE_ADRESSE;
}

/**
 * Zaehlt die Anfrage und sagt, ob sie durchgelassen wird.
 *
 * Zaehlt **nur**, wenn sie erlaubt ist. Sonst wuerde ein Angreifer, der
 * weiterhaemmert, das Fenster endlos nach hinten schieben und damit auch den
 * echten Nutzer hinter derselben Adresse aussperren - bei Mobilfunk mit
 * geteilter Adresse ist das ein realer Fall, nicht ein theoretischer.
 */
export async function pruefeUndZaehle(
  speicher: ZaehlerSpeicher,
  adresse: string,
  jetzt: number,
  limit: number = CREATE_LIMIT_PER_WINDOW,
  fensterSekunden: number = CREATE_WINDOW_SECONDS,
): Promise<RateLimitErgebnis> {
  const fensterMs = fensterSekunden * 1000;
  const fenster = Math.floor(jetzt / fensterMs);
  const schluessel = `rl:new:${adresse}:${fenster}`;
  const wartenSekunden = Math.ceil(((fenster + 1) * fensterMs - jetzt) / 1000);

  const roh = await speicher.get(schluessel);
  const stand = roh === null ? 0 : Number.parseInt(roh, 10);
  // Ein unlesbarer Wert darf nicht zum Freifahrtschein werden.
  const bisher = Number.isFinite(stand) && stand >= 0 ? stand : limit;

  if (bisher >= limit) {
    return { erlaubt: false, stand: bisher, wartenSekunden };
  }

  await speicher.put(schluessel, String(bisher + 1), {
    // Doppelte Fensterlaenge, damit der Eintrag das Fenster sicher ueberlebt
    // und danach von selbst verschwindet - kein Aufraeumen noetig.
    expirationTtl: Math.max(60, fensterSekunden * 2),
  });

  return { erlaubt: true, stand: bisher + 1, wartenSekunden };
}
