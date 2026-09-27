import { FORCE_RECORD_AFTER_MS, MAX_ACCURACY_METERS, isUsableFix } from './locationQuality';

const NOW = 1_700_000_000_000;

describe('isUsableFix', () => {
  it('nimmt einen genauen Satellitenfix an', () => {
    expect(isUsableFix(8, NOW, NOW - 30_000)).toBe(true);
  });

  it('nimmt einen Fix genau an der Schwelle noch an', () => {
    expect(isUsableFix(MAX_ACCURACY_METERS, NOW, NOW - 30_000)).toBe(true);
  });

  it('verwirft eine grobe Mobilfunk-Ortung kurz nach dem letzten Punkt', () => {
    expect(isUsableFix(180, NOW, NOW - 30_000)).toBe(false);
  });

  it('behaelt einen Punkt ohne Genauigkeitsangabe, weil er nicht beurteilbar ist', () => {
    expect(isUsableFix(null, NOW, NOW - 30_000)).toBe(true);
    expect(isUsableFix(undefined, NOW, NOW - 30_000)).toBe(true);
  });

  it('nimmt den allerersten Punkt einer Tour auch bei schlechtem Empfang an', () => {
    expect(isUsableFix(500, NOW, null)).toBe(true);
  });

  it('laesst nach langer Funkstille auch einen groben Punkt durch', () => {
    // Im Ernstfall ist ein ungenauer Standort besser als eine Luecke.
    expect(isUsableFix(400, NOW, NOW - FORCE_RECORD_AFTER_MS)).toBe(true);
    expect(isUsableFix(400, NOW, NOW - FORCE_RECORD_AFTER_MS - 1)).toBe(true);
  });

  it('haelt einen groben Punkt kurz vor Ablauf der Frist noch zurueck', () => {
    expect(isUsableFix(400, NOW, NOW - FORCE_RECORD_AFTER_MS + 1)).toBe(false);
  });

  it('filtert die Ausreisser aus der Vergleichsmessung gegen die Garmin-Uhr', () => {
    // Echte Werte aus der Tour vom 27.09.2026: Spruenge von mehreren hundert
    // Metern innerhalb einer halben Minute, gemeldet mit entsprechend
    // schlechter Genauigkeit.
    const lastRecordedAt = NOW - 47_000; // typischer Abstand auf dieser Tour
    expect(isUsableFix(120, NOW, lastRecordedAt)).toBe(false);
    expect(isUsableFix(12, NOW, lastRecordedAt)).toBe(true);
  });
});
