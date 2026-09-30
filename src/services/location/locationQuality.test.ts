import {
  FORCE_RECORD_AFTER_MS,
  MAX_ACCURACY_METERS,
  MAX_CONSECUTIVE_REJECTS,
  MAX_JUDGED_GAP_MS,
  isPlausibleMove,
  isUsableFix,
} from './locationQuality';

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

describe('isPlausibleMove', () => {
  const SEKUNDE = 1000;

  it('nimmt normale Radgeschwindigkeit an', () => {
    // 25 km/h entsprechen rund 70 m in 10 Sekunden.
    expect(isPlausibleMove(70, 10 * SEKUNDE, 0)).toBe(true);
  });

  it('nimmt eine schnelle Abfahrt an', () => {
    // 75 km/h - auf dem Rennrad oder mit Ski erreichbar.
    expect(isPlausibleMove(208, 10 * SEKUNDE, 0)).toBe(true);
  });

  it('verwirft die Spruenge der Radtour vom 29.09.2026', () => {
    // Echte Werte aus dem Track, jeweils mit unauffaelliger Genauigkeitsangabe
    // gemeldet und deshalb am Genauigkeitsfilter vorbeigekommen.
    expect(isPlausibleMove(834, 18 * SEKUNDE, 0)).toBe(false); // 163,5 km/h
    expect(isPlausibleMove(519, 16 * SEKUNDE, 0)).toBe(false); // 113,7 km/h
    expect(isPlausibleMove(470, 17 * SEKUNDE, 0)).toBe(false); //  97,7 km/h
    expect(isPlausibleMove(294, 5 * SEKUNDE, 0)).toBe(false); // 201,5 km/h
  });

  it('laesst die echte Bewegung derselben Tour unangetastet', () => {
    // Auf der Heimfahrt hatte der Filter nichts zu tun - das muss so bleiben.
    expect(isPlausibleMove(646 / 2, 37 * SEKUNDE, 0)).toBe(true);
    expect(isPlausibleMove(160, 29 * SEKUNDE, 0)).toBe(true);
  });

  it('urteilt nach einer langen Funkpause nicht', () => {
    // Nach einem Tunnel ist ein weiter Sprung echt.
    expect(isPlausibleMove(5000, MAX_JUDGED_GAP_MS + 1, 0)).toBe(true);
  });

  it('urteilt kurz vor Ablauf der Frist noch', () => {
    expect(isPlausibleMove(5000, MAX_JUDGED_GAP_MS - 1, 0)).toBe(false);
  });

  it('gibt nach mehreren Verwerfungen hintereinander auf', () => {
    // Wichtigste Sicherung: War der Ankerpunkt selbst falsch, wuerde sonst der
    // gesamte Rest der Tour verworfen.
    expect(isPlausibleMove(834, 18 * SEKUNDE, MAX_CONSECUTIVE_REJECTS - 1)).toBe(false);
    expect(isPlausibleMove(834, 18 * SEKUNDE, MAX_CONSECUTIVE_REJECTS)).toBe(true);
  });

  it('urteilt nicht ohne verstrichene Zeit', () => {
    // Gebuendelt nachgelieferte Standorte koennen denselben Zeitstempel tragen.
    expect(isPlausibleMove(500, 0, 0)).toBe(true);
    expect(isPlausibleMove(500, -1000, 0)).toBe(true);
  });

  it('nimmt Stillstand an', () => {
    expect(isPlausibleMove(0, 10 * SEKUNDE, 0)).toBe(true);
  });
});
