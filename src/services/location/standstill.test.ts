import type { TrackPoint } from '../../types/location';
import {
  STANDSTILL_NOTICE_AFTER_MS,
  STANDSTILL_RADIUS_METERS,
  isStandstill,
  stationarySince,
} from './standstill';

const START = Date.UTC(2026, 9, 3, 11, 0, 0);

/** Ein Punkt, `sekunden` nach Beginn, `meterOst` oestlich des Ausgangsorts. */
function punkt(sekunden: number, meterOst = 0): TrackPoint {
  // Auf 47,33 Grad Nord entspricht ein Grad Laenge rund 75.600 m.
  return {
    latitude: 47.33,
    longitude: 11.18 + meterOst / 75_600,
    timestamp: START + sekunden * 1000,
  };
}

describe('stationarySince', () => {
  it('gibt ohne genug Punkte null zurueck', () => {
    expect(stationarySince([])).toBeNull();
    expect(stationarySince([punkt(0)])).toBeNull();
  });

  it('erkennt, seit wann jemand am Fleck ist', () => {
    // Von 0 bis 300 s unterwegs, danach bis 900 s am selben Ort.
    const punkte = [punkt(0, 0), punkt(120, 400), punkt(300, 800), punkt(600, 805), punkt(900, 803)];
    expect(stationarySince(punkte)).toBe(START + 300 * 1000);
  });

  it('meldet null, solange sich jemand bewegt', () => {
    const punkte = [punkt(0, 0), punkt(60, 200), punkt(120, 400)];
    expect(stationarySince(punkte)).toBeNull();
  });

  it('meldet bei langsamem Gehen keinen Stillstand', () => {
    // Das ist der Grund, gegen den LETZTEN Punkt zu messen statt entlang der
    // Kette. Jeder Einzelschritt liegt mit 20 m unter dem Umkreis; entlang der
    // Kette gerechnet stuende die Person seit Beginn still, obwohl sie 80 m
    // weitergekommen ist. Gegen den letzten Punkt gemessen reicht der Rueckblick
    // nur bis zum vorletzten - die Spanne bleibt weit unter der Meldeschwelle.
    const punkte = [punkt(0, 0), punkt(60, 20), punkt(120, 40), punkt(180, 60), punkt(240, 80)];
    const seit = stationarySince(punkte);
    expect(seit).toBe(START + 180 * 1000);
    expect(isStandstill(seit, START + 240 * 1000)).toBe(false);
  });

  it('laesst sich vom Zappeln der Position nicht stoeren', () => {
    // Im Stand schwankt die gemessene Position um einige Meter. Waere der
    // Umkreis zu eng, setzte jeder Zappler den Stillstand zurueck.
    const punkte = [punkt(0, 300), punkt(300, 2), punkt(600, -3), punkt(900, 4), punkt(1200, -2)];
    expect(stationarySince(punkte)).toBe(START + 300 * 1000);
  });

  it('haelt sich an den uebergebenen Umkreis', () => {
    const punkte = [punkt(0, 0), punkt(300, 30), punkt(600, 32)];
    // 30 m vom letzten Punkt entfernt: bei 25 m draussen, bei 50 m drinnen.
    expect(stationarySince(punkte, 25)).toBe(START + 300 * 1000);
    expect(stationarySince(punkte, 50)).toBe(START);
  });

  it('nimmt einen Punkt genau am Rand noch mit', () => {
    const punkte = [punkt(0, STANDSTILL_RADIUS_METERS), punkt(300, 0)];
    expect(stationarySince(punkte)).toBe(START);
  });
});

describe('isStandstill', () => {
  const jetzt = START + 10 * 60 * 1000;

  it('meldet ohne Stillstand nichts', () => {
    expect(isStandstill(null, jetzt)).toBe(false);
  });

  it('meldet erst nach der Mindestdauer', () => {
    // Eine kurze Trinkpause ist keine Meldung wert - ein Hinweis, der staendig
    // kommt, wird nicht mehr gelesen.
    expect(isStandstill(jetzt - STANDSTILL_NOTICE_AFTER_MS + 1000, jetzt)).toBe(false);
    expect(isStandstill(jetzt - STANDSTILL_NOTICE_AFTER_MS, jetzt)).toBe(true);
  });

  it('meldet einen langen Stillstand', () => {
    // Der Fall, um den es geht: jemand wartet auf Rettung.
    expect(isStandstill(START, START + 3 * 60 * 60 * 1000)).toBe(true);
  });
});
