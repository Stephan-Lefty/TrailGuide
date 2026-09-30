import type { TrackPoint } from '../../types/location';

const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Entfernung zwischen zwei Koordinaten in Metern (Haversine).
 *
 * Die Erde wird dabei als Kugel angenommen. Der Fehler gegenueber der
 * tatsaechlichen Abplattung liegt bei etwa 0,3 % - fuer die Anzeige einer
 * Tourlaenge weit genau genug.
 */
export function distanceBetween(a: TrackPoint, b: TrackPoint): number {
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const deltaLat = lat2 - lat1;
  const deltaLon = toRadians(b.longitude - a.longitude);

  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

/**
 * Summe aller Teilstrecken eines Tracks in Metern.
 *
 * Die Punkte muessen zeitlich sortiert sein - genau so liefert sie
 * listTrackPoints(). Bei weniger als zwei Punkten gibt es keine Strecke.
 */
export function totalDistanceMeters(points: TrackPoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += distanceBetween(points[i - 1], points[i]);
  }
  return total;
}

/**
 * Ab welchem Hoehenunterschied ein Anstieg als echt gilt.
 *
 * Die per GPS gemessene Hoehe schwankt deutlich staerker als die Position -
 * ueblich ist etwa das Eineinhalbfache des horizontalen Fehlers, bei 10 m
 * Genauigkeit also rund 15 m. Wuerde man einfach alle Aufwaertsschritte
 * addieren, kaeme selbst auf einer Fahrt durch die Ebene ein dreistelliger
 * Wert zusammen: das Rauschen geht abwechselnd hoch und runter, und die
 * Summe zaehlt jedes Zappeln mit.
 *
 * Deshalb ein Ankerpunkt mit Schwelle: Erst wenn sich die Hoehe um mehr als
 * diesen Betrag vom letzten Anker entfernt hat, gilt das als Steigung, und
 * der Anker wandert mit. Bewegungen darunter werden verworfen.
 */
export const ALTITUDE_THRESHOLD_METERS = 10;

export interface ElevationGain {
  /** Summe aller echten Anstiege in Metern. */
  up: number;
  /** Summe aller echten Abstiege in Metern, als positive Zahl. */
  down: number;
}

/**
 * Hoehenmeter auf- und abwaerts.
 *
 * Punkte ohne Hoehenangabe werden uebersprungen - Aufzeichnungen aus der Zeit
 * vor 1.0.2 haben gar keine, und dann kommt {up: 0, down: 0} heraus.
 */
export function elevationGain(
  points: TrackPoint[],
  thresholdMeters: number = ALTITUDE_THRESHOLD_METERS,
): ElevationGain {
  const heights = points
    .map((point) => point.altitude)
    .filter((altitude): altitude is number => altitude !== null && altitude !== undefined);

  if (heights.length < 2) {
    return { up: 0, down: 0 };
  }

  let up = 0;
  let down = 0;
  let anchor = heights[0];

  for (const height of heights.slice(1)) {
    const delta = height - anchor;
    if (delta > thresholdMeters) {
      up += delta;
      anchor = height;
    } else if (delta < -thresholdMeters) {
      down -= delta;
      anchor = height;
    }
  }

  return { up, down };
}

/**
 * Hoehenmeter fuer die Anzeige, etwa "+400 / -380 m". Gibt null zurueck, wenn
 * es nichts zu zeigen gibt - dann soll die Zeile die Angabe ganz weglassen
 * statt "+0 / -0 m" zu behaupten.
 */
export function formatElevation(gain: ElevationGain): string | null {
  if (gain.up < 1 && gain.down < 1) {
    return null;
  }
  return `+${Math.round(gain.up)} / -${Math.round(gain.down)} m`;
}

/**
 * Streckenlaenge fuer die Anzeige. Unter einem Kilometer in Metern, darueber
 * in Kilometern mit einer Nachkommastelle - so wie es Wander-Apps ueblicherweise
 * halten.
 *
 * Das Dezimaltrennzeichen richtet sich nach der Sprache: auf Deutsch "22,3 km".
 * Ohne Angabe gilt die Einstellung des Geraets.
 */
export function formatDistance(meters: number, locale?: string): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const kilometers = (meters / 1000).toLocaleString(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return `${kilometers} km`;
}
