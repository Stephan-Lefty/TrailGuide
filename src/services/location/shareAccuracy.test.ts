import { MAX_ACCURACY_METERS } from './locationQuality';
import {
  MAX_WAIT_FOR_FIX_MS,
  rateAccuracy,
  roundAccuracy,
  shouldKeepWaiting,
} from './shareAccuracy';

describe('rateAccuracy', () => {
  it('haelt einen Satellitenfix fuer gut', () => {
    expect(rateAccuracy(4)).toBe('good');
    expect(rateAccuracy(30)).toBe('good');
    expect(rateAccuracy(MAX_ACCURACY_METERS)).toBe('good');
  });

  it('haelt eine Funkzellen-Schaetzung fuer grob', () => {
    expect(rateAccuracy(MAX_ACCURACY_METERS + 1)).toBe('rough');
    expect(rateAccuracy(1500)).toBe('rough');
  });

  it('erkennt eine fehlende Angabe als unbekannt', () => {
    expect(rateAccuracy(null)).toBe('unknown');
    expect(rateAccuracy(undefined)).toBe('unknown');
    expect(rateAccuracy(Number.NaN)).toBe('unknown');
    expect(rateAccuracy(Number.POSITIVE_INFINITY)).toBe('unknown');
  });

  it('beurteilt die vier geteilten Standorte der Radtour als gut', () => {
    // Nachgemessen gegen den Referenztrack lagen sie 4, 30, 2 und 3 m neben
    // der gefahrenen Strecke - alle innerhalb der Schwelle.
    for (const gemessen of [4, 30, 2, 3]) {
      expect(rateAccuracy(gemessen)).toBe('good');
    }
  });
});

describe('shouldKeepWaiting', () => {
  it('wartet nicht weiter, wenn der Standort gut ist', () => {
    expect(shouldKeepWaiting(8, 0)).toBe(false);
  });

  it('wartet bei grobem Standort weiter', () => {
    expect(shouldKeepWaiting(800, 0)).toBe(true);
    expect(shouldKeepWaiting(800, MAX_WAIT_FOR_FIX_MS - 1)).toBe(true);
  });

  it('gibt nach Ablauf des Fensters auf', () => {
    // Im Ernstfall darf die Nachricht nicht an der Wartezeit haengen.
    expect(shouldKeepWaiting(800, MAX_WAIT_FOR_FIX_MS)).toBe(false);
    expect(shouldKeepWaiting(null, MAX_WAIT_FOR_FIX_MS)).toBe(false);
  });

  it('wartet auch bei fehlender Angabe, aber nicht endlos', () => {
    expect(shouldKeepWaiting(null, 0)).toBe(true);
    expect(shouldKeepWaiting(null, MAX_WAIT_FOR_FIX_MS + 1)).toBe(false);
  });
});

describe('roundAccuracy', () => {
  it('rundet kleine Werte auf ganze Meter', () => {
    expect(roundAccuracy(12.384)).toBe(12);
    expect(roundAccuracy(4.6)).toBe(5);
  });

  it('rundet mittlere Werte auf Zehner', () => {
    expect(roundAccuracy(34)).toBe(30);
    expect(roundAccuracy(87)).toBe(90);
  });

  it('rundet grosse Werte auf Fuenfziger', () => {
    expect(roundAccuracy(230)).toBe(250);
    expect(roundAccuracy(1480)).toBe(1500);
  });
});
