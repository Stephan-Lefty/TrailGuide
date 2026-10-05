import { describe, expect, it } from 'vitest';
import {
  CREATE_LIMIT_PER_WINDOW,
  CREATE_WINDOW_SECONDS,
  UNBEKANNTE_ADRESSE,
  adresseAusAnfrage,
  pruefeUndZaehle,
  type ZaehlerSpeicher,
} from './rateLimit';

/** Nachbau von Workers KV, soweit die Begrenzung ihn braucht. */
function speicher(start: Record<string, string> = {}) {
  const daten = new Map(Object.entries(start));
  const schreibvorgaenge: { key: string; value: string; ttl?: number }[] = [];
  const s: ZaehlerSpeicher = {
    async get(key) {
      return daten.get(key) ?? null;
    },
    async put(key, value, options) {
      daten.set(key, value);
      schreibvorgaenge.push({ key, value, ttl: options?.expirationTtl });
    },
  };
  return { s, daten, schreibvorgaenge };
}

const JETZT = 1_760_000_000_000;

describe('pruefeUndZaehle', () => {
  it('laesst die erste Anfrage durch und zaehlt sie', async () => {
    const { s, schreibvorgaenge } = speicher();
    const e = await pruefeUndZaehle(s, '203.0.113.7', JETZT);
    expect(e.erlaubt).toBe(true);
    expect(e.stand).toBe(1);
    expect(schreibvorgaenge).toHaveLength(1);
  });

  it('laesst genau das Limit durch und sperrt danach', async () => {
    const { s } = speicher();
    for (let i = 1; i <= CREATE_LIMIT_PER_WINDOW; i += 1) {
      const e = await pruefeUndZaehle(s, '203.0.113.7', JETZT);
      expect(e.erlaubt).toBe(true);
      expect(e.stand).toBe(i);
    }
    const zuviel = await pruefeUndZaehle(s, '203.0.113.7', JETZT);
    expect(zuviel.erlaubt).toBe(false);
  });

  it('zaehlt abgewiesene Anfragen NICHT mit', async () => {
    // Sonst schiebt ein Angreifer, der weiterhaemmert, das Fenster endlos nach
    // hinten und sperrt damit auch den echten Nutzer hinter derselben Adresse
    // aus. Bei Mobilfunk mit geteilter Adresse ist das ein realer Fall.
    const { s, schreibvorgaenge } = speicher({
      [`rl:new:203.0.113.7:${Math.floor(JETZT / (CREATE_WINDOW_SECONDS * 1000))}`]:
        String(CREATE_LIMIT_PER_WINDOW),
    });
    const e = await pruefeUndZaehle(s, '203.0.113.7', JETZT);
    expect(e.erlaubt).toBe(false);
    expect(e.stand).toBe(CREATE_LIMIT_PER_WINDOW);
    expect(schreibvorgaenge).toHaveLength(0);
  });

  it('zaehlt Adressen getrennt', async () => {
    const { s } = speicher();
    for (let i = 0; i < CREATE_LIMIT_PER_WINDOW; i += 1) {
      await pruefeUndZaehle(s, '203.0.113.7', JETZT);
    }
    const andere = await pruefeUndZaehle(s, '203.0.113.8', JETZT);
    expect(andere.erlaubt).toBe(true);
    expect(andere.stand).toBe(1);
  });

  it('gibt im naechsten Zeitfenster wieder frei', async () => {
    const { s } = speicher();
    for (let i = 0; i < CREATE_LIMIT_PER_WINDOW; i += 1) {
      await pruefeUndZaehle(s, '203.0.113.7', JETZT);
    }
    expect((await pruefeUndZaehle(s, '203.0.113.7', JETZT)).erlaubt).toBe(false);

    const spaeter = JETZT + CREATE_WINDOW_SECONDS * 1000;
    const e = await pruefeUndZaehle(s, '203.0.113.7', spaeter);
    expect(e.erlaubt).toBe(true);
    expect(e.stand).toBe(1);
  });

  it('nennt die Wartezeit bis zum naechsten Fenster', async () => {
    const fensterMs = CREATE_WINDOW_SECONDS * 1000;
    const kurzVorSchluss = Math.floor(JETZT / fensterMs) * fensterMs + fensterMs - 5_000;
    const { s } = speicher({
      [`rl:new:203.0.113.7:${Math.floor(kurzVorSchluss / fensterMs)}`]:
        String(CREATE_LIMIT_PER_WINDOW),
    });
    const e = await pruefeUndZaehle(s, '203.0.113.7', kurzVorSchluss);
    expect(e.erlaubt).toBe(false);
    expect(e.wartenSekunden).toBe(5);
  });

  it('laesst einen unlesbaren Zaehlerstand nicht zum Freifahrtschein werden', async () => {
    const { s } = speicher({
      [`rl:new:203.0.113.7:${Math.floor(JETZT / (CREATE_WINDOW_SECONDS * 1000))}`]: 'kaputt',
    });
    const e = await pruefeUndZaehle(s, '203.0.113.7', JETZT);
    expect(e.erlaubt).toBe(false);
  });

  it('setzt eine Verfallszeit, damit die Zaehler von selbst verschwinden', async () => {
    const { s, schreibvorgaenge } = speicher();
    await pruefeUndZaehle(s, '203.0.113.7', JETZT);
    expect(schreibvorgaenge[0].ttl).toBeGreaterThanOrEqual(CREATE_WINDOW_SECONDS);
  });
});

describe('adresseAusAnfrage', () => {
  it('nimmt CF-Connecting-IP', () => {
    const r = new Request('https://example.test/api/track/new', {
      headers: { 'CF-Connecting-IP': '203.0.113.7' },
    });
    expect(adresseAusAnfrage(r)).toBe('203.0.113.7');
  });

  it('wirft Anfragen ohne Adresse in einen gemeinsamen Eimer', () => {
    // Nicht unbegrenzt durchlassen - sonst waere das Weglassen des Kopfes der
    // Weg um die Begrenzung herum.
    const r = new Request('https://example.test/api/track/new');
    expect(adresseAusAnfrage(r)).toBe(UNBEKANNTE_ADRESSE);
  });
});
