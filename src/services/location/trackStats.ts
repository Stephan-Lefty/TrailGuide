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
