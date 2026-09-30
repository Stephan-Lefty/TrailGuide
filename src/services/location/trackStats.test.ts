import type { TrackPoint } from '../../types/location';
import { distanceBetween, formatDistance, totalDistanceMeters } from './trackStats';

function punkt(latitude: number, longitude: number, timestamp = 0): TrackPoint {
  return { latitude, longitude, timestamp };
}

describe('distanceBetween', () => {
  it('gibt fuer denselben Punkt null Meter zurueck', () => {
    expect(distanceBetween(punkt(47.37, 11.15), punkt(47.37, 11.15))).toBe(0);
  });

  it('rechnet einen Breitengrad-Abstand korrekt', () => {
    // Ein Zehntel Breitengrad entspricht rund 11,1 km - unabhaengig vom Laengengrad.
    const d = distanceBetween(punkt(47.3, 11.15), punkt(47.4, 11.15));
    expect(d).toBeGreaterThan(11_000);
    expect(d).toBeLessThan(11_200);
  });

  it('beruecksichtigt, dass Laengengrade am Pol zusammenlaufen', () => {
    const amAequator = distanceBetween(punkt(0, 0), punkt(0, 1));
    const inTirol = distanceBetween(punkt(47.37, 11.0), punkt(47.37, 12.0));
    // cos(47,37 Grad) ist etwa 0,677.
    expect(inTirol / amAequator).toBeCloseTo(0.677, 2);
  });

  it('ist richtungsunabhaengig', () => {
    const a = punkt(47.3739067, 11.1492667);
    const b = punkt(47.3598383, 11.16519);
    expect(distanceBetween(a, b)).toBeCloseTo(distanceBetween(b, a), 6);
  });
});

describe('totalDistanceMeters', () => {
  it('gibt ohne Punkte null zurueck', () => {
    expect(totalDistanceMeters([])).toBe(0);
  });

  it('gibt bei einem einzelnen Punkt null zurueck', () => {
    expect(totalDistanceMeters([punkt(47.37, 11.15)])).toBe(0);
  });

  it('summiert die Teilstrecken auf', () => {
    const punkte = [punkt(47.3, 11.15), punkt(47.35, 11.15), punkt(47.4, 11.15)];
    const einzeln =
      distanceBetween(punkte[0], punkte[1]) + distanceBetween(punkte[1], punkte[2]);
    expect(totalDistanceMeters(punkte)).toBeCloseTo(einzeln, 6);
  });

  it('rechnet die zwei geteilten Standorte der Radtour vom 29.09.2026 nach', () => {
    // Beide Punkte kamen aus der App und lagen laut Referenztrack nur wenige
    // Meter neben der gefahrenen Strecke.
    const d = totalDistanceMeters([
      punkt(47.3739067, 11.1492667),
      punkt(47.3732233, 11.1525767),
    ]);
    expect(d).toBeGreaterThan(200);
    expect(d).toBeLessThan(300);
  });
});

describe('formatDistance', () => {
  it('zeigt kurze Strecken in ganzen Metern', () => {
    expect(formatDistance(0, 'de-DE')).toBe('0 m');
    expect(formatDistance(248.6, 'de-DE')).toBe('249 m');
    expect(formatDistance(999, 'de-DE')).toBe('999 m');
  });

  it('wechselt ab einem Kilometer auf Kilometer', () => {
    expect(formatDistance(1000, 'de-DE')).toBe('1,0 km');
    expect(formatDistance(22_330, 'de-DE')).toBe('22,3 km');
  });

  it('benutzt das Dezimaltrennzeichen der jeweiligen Sprache', () => {
    expect(formatDistance(21_820, 'de-DE')).toBe('21,8 km');
    expect(formatDistance(21_820, 'en-GB')).toBe('21.8 km');
  });
});
