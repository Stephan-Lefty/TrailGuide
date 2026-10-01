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
 *
 * Der Wert stand zunaechst bei 10 m - uebernommen aus der Praxis barometrischer
 * Hoehenmesser, und fuer GPS deutlich zu niedrig. Die Wanderung am 30.09.2026
 * machte das sichtbar: 4,2 km mit tatsaechlich rund 30 Hoehenmetern meldete die
 * App als +496 m, das Sechzehnfache. Der gemessene Hoehenfehler lag bei 11,5 m
 * Standardabweichung, die Spanne reichte von -39 bis +32 m - Zappeln in dieser
 * Groesse laesst eine 10-Meter-Schwelle ungehindert durch.
 *
 * 30 m zusammen mit der Glaettung darunter ist an zwei Faellen geprueft: an der
 * flachen Wanderung (gemeldet +74 statt +30 m) und an einem kuenstlichen Berg
 * aus demselben Rauschen und denselben Zeitstempeln, aber 800 Hoehenmetern
 * (gemeldet +772 m, also 4 % zu wenig). Der verbleibende Fehler ist auf flachem
 * Gelaende absolut klein und auf einer Bergtour anteilig klein - und er geht
 * nach unten statt nach oben, was die ehrlichere Richtung ist.
 */
export const ALTITUDE_THRESHOLD_METERS = 30;

/**
 * Zeitfenster des gleitenden Medians, mit dem die Hoehen vor der Summierung
 * geglaettet werden.
 *
 * Die Schwelle allein reicht nicht, weil der Hoehenfehler des Telefons kein
 * weisses Rauschen ist, sondern traege driftet. Bei der Wanderung am
 * 30.09.2026 lag die Autokorrelation des Fehlers bei 0,74 von einem Punkt zum
 * naechsten - der Wert ist also ueber eine halbe Minute hinweg in dieselbe
 * Richtung verzogen. Eine Schwelle kann so etwas nicht erkennen: Fuer sie
 * sieht eine zehn Minuten lange Verschiebung um 25 Meter genauso aus wie ein
 * echter Anstieg. Der Median ueber zwei Minuten dagegen mittelt die Drift weg,
 * ohne eine echte Steigung abzuflachen - bei einem gleichmaessigen Anstieg
 * liegt der Median genau auf der Rampe.
 *
 * Zwei Minuten sind der Kompromiss aus der Messung: kuerzer laesst zu viel
 * Drift durch, laenger bringt kaum noch etwas und verschleift den Anfang und
 * das Ende der Aufzeichnung.
 */
export const ALTITUDE_SMOOTHING_WINDOW_MS = 2 * 60 * 1000;

/**
 * Anteil, der im Glaettungsfenster oben und unten jeweils abgeschnitten wird.
 */
export const ALTITUDE_TRIM_RATIO = 0.2;

/**
 * Gleitender getrimmter Mittelwert der Hoehenwerte ueber ein Zeitfenster.
 *
 * Die Wahl des Mittelungsverfahrens ist an drei Faellen geprueft worden, und
 * sie faellt nicht so aus, wie man zunaechst denkt:
 *
 * - Der Median liegt nahe, weil er einzelne Ausreisser ignoriert - und die gab
 *   es, bis zu 42 m in einem Schritt. Er hat aber eine Schwaeche, die bei
 *   genau diesem Signal auftritt: Wechselt die Hoehe regelmaessig zwischen zwei
 *   Werten, enthaelt das Fenster von beiden gleich viele, und der Median
 *   springt mit statt zu mitteln. In der Pruefung mit einem symmetrischen
 *   Wechsel um +-20 m auf ebener Strecke meldete er 1120 Hoehenmeter.
 * - Der einfache Mittelwert loest genau das (dort: 0 m), laesst sich aber von
 *   einem einzelnen groben Wert mitziehen.
 * - Der getrimmte Mittelwert nimmt von beiden das Gute: erst die extremen
 *   ALTITUDE_TRIM_RATIO oben und unten wegwerfen, dann mitteln.
 *
 * Gemessen an der Wanderung vom 30.09.2026 (tatsaechlich rund +30 m):
 * Median 74 m, Mittelwert 65 m, getrimmter Mittelwert 32 m. Am kuenstlichen
 * Berg mit demselben Rauschen und 800 echten Hoehenmetern: 772 / 747 / 758 m.
 * Der getrimmte Mittelwert ist in allen drei Pruefungen der beste.
 *
 * Das Fenster wandert mit zwei Zeigern mit, damit die Berechnung auch bei einer
 * langen Tour mit mehreren tausend Punkten in der Tourenliste nicht spuerbar
 * wird.
 */
export function smoothAltitudes(
  samples: { timestamp: number; altitude: number }[],
  windowMs: number = ALTITUDE_SMOOTHING_WINDOW_MS,
): number[] {
  const half = windowMs / 2;
  const result: number[] = [];
  let from = 0;
  let to = 0;

  for (let i = 0; i < samples.length; i += 1) {
    const center = samples[i].timestamp;
    while (from < samples.length && samples[from].timestamp < center - half) from += 1;
    while (to < samples.length && samples[to].timestamp <= center + half) to += 1;

    const window = samples
      .slice(from, Math.max(to, from + 1))
      .map((sample) => sample.altitude)
      .sort((a, b) => a - b);

    // Bei kurzen Fenstern bliebe nach dem Beschneiden nichts uebrig - dann
    // ungetrimmt mitteln, statt den Punkt zu verlieren.
    const cut = Math.floor(window.length * ALTITUDE_TRIM_RATIO);
    const core = window.length - 2 * cut > 0 ? window.slice(cut, window.length - cut) : window;
    result.push(core.reduce((sum, value) => sum + value, 0) / core.length);
  }

  return result;
}

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
  smoothingWindowMs: number = ALTITUDE_SMOOTHING_WINDOW_MS,
): ElevationGain {
  const samples = points
    .filter(
      (point): point is TrackPoint & { altitude: number } =>
        point.altitude !== null && point.altitude !== undefined,
    )
    .map((point) => ({ timestamp: point.timestamp, altitude: point.altitude }));

  if (samples.length < 2) {
    return { up: 0, down: 0 };
  }

  const heights = smoothAltitudes(samples, smoothingWindowMs);

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
