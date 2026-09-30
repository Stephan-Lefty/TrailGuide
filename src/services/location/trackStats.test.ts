import type { TrackPoint } from '../../types/location';
import {
  ALTITUDE_THRESHOLD_METERS,
  distanceBetween,
  elevationGain,
  formatDistance,
  formatElevation,
  totalDistanceMeters,
} from './trackStats';

function punkt(latitude: number, longitude: number, timestamp = 0): TrackPoint {
  return { latitude, longitude, timestamp };
}

function hoehenpunkt(altitude: number | null): TrackPoint {
  return { latitude: 47.37, longitude: 11.15, timestamp: 0, altitude };
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

describe('elevationGain', () => {
  it('gibt ohne Hoehenangaben null zurueck', () => {
    // Alle Aufzeichnungen vor 1.0.2 sehen so aus.
    expect(elevationGain([hoehenpunkt(null), hoehenpunkt(null)])).toEqual({ up: 0, down: 0 });
    expect(elevationGain([punkt(47.37, 11.15), punkt(47.38, 11.15)])).toEqual({ up: 0, down: 0 });
  });

  it('gibt bei einem einzelnen Hoehenwert null zurueck', () => {
    expect(elevationGain([hoehenpunkt(1200)])).toEqual({ up: 0, down: 0 });
  });

  it('zaehlt einen klaren Anstieg', () => {
    const gain = elevationGain([hoehenpunkt(1100), hoehenpunkt(1200), hoehenpunkt(1300)]);
    expect(gain.up).toBe(200);
    expect(gain.down).toBe(0);
  });

  it('zaehlt Anstieg und Abstieg getrennt', () => {
    const gain = elevationGain([hoehenpunkt(1100), hoehenpunkt(1300), hoehenpunkt(1150)]);
    expect(gain.up).toBe(200);
    expect(gain.down).toBe(150);
  });

  it('verwirft Zappeln unter der Schwelle', () => {
    // Das ist der Kern: eine Fahrt durch die Ebene, bei der die per GPS
    // gemessene Hoehe um wenige Meter schwankt. Ohne Schwelle kaemen hier
    // zweistellige Hoehenmeter zusammen, die es nie gab.
    const rauschen = [1200, 1204, 1197, 1203, 1198, 1202, 1199, 1201];
    const gain = elevationGain(rauschen.map(hoehenpunkt));
    expect(gain.up).toBe(0);
    expect(gain.down).toBe(0);
  });

  it('erkennt einen Anstieg, der sich aus kleinen Schritten aufbaut', () => {
    // Jeder Einzelschritt liegt unter der Schwelle, die Summe nicht - der
    // Ankerpunkt bleibt liegen, bis die Schwelle ueberschritten ist.
    const gain = elevationGain([1200, 1204, 1208, 1212, 1216].map(hoehenpunkt));
    expect(gain.up).toBeGreaterThan(0);
    expect(gain.down).toBe(0);
  });

  it('haelt sich an die uebergebene Schwelle', () => {
    const werte = [1200, 1206, 1200].map(hoehenpunkt);
    expect(elevationGain(werte, 10).up).toBe(0);
    expect(elevationGain(werte, 5).up).toBe(6);
  });

  it('ueberspringt einzelne Punkte ohne Hoehenangabe', () => {
    const gain = elevationGain([hoehenpunkt(1100), hoehenpunkt(null), hoehenpunkt(1300)]);
    expect(gain.up).toBe(200);
  });

  it('bleibt bei der Radtour vom 29.09.2026 in der Groessenordnung der Referenz', () => {
    // Komoot weist fuer die Tour +400 / -380 m aus. Nachgerechnet mit dem
    // Verfahren dieses Moduls ergab derselbe Track bei der Schwelle von
    // ALTITUDE_THRESHOLD_METERS 364 / 344 m - rund 9 % weniger, weil die
    // Schwelle neben dem Rauschen auch echte kleine Wellen schluckt. Die
    // Anzeige unterschaetzt also eher, statt zu uebertreiben.
    const treppe = Array.from({ length: 20 }, (_, i) => hoehenpunkt(1100 + i * 20));
    const gain = elevationGain(treppe, ALTITUDE_THRESHOLD_METERS);
    expect(gain.up).toBe(380);
    expect(gain.down).toBe(0);
  });
});

describe('formatElevation', () => {
  it('laesst die Angabe weg, wenn es nichts zu zeigen gibt', () => {
    // Lieber keine Zeile als "+0 / -0 m" - Aufzeichnungen vor 1.0.2 haben
    // ueberhaupt keine Hoehendaten.
    expect(formatElevation({ up: 0, down: 0 })).toBeNull();
  });

  it('schreibt Anstieg und Abstieg gerundet', () => {
    expect(formatElevation({ up: 400.4, down: 379.6 })).toBe('+400 / -380 m');
  });
});
