/**
 * Erkennt, dass sich jemand nicht mehr von der Stelle bewegt.
 *
 * Der Anlass kam aus der Bergtour vom 03.10.2026. Waehrend einer dreistuendigen
 * Rast lieferte Android nur alle 60 bis 630 Sekunden einen Standort - der
 * Live-Link zeigte in dieser Zeit "Aktualisiert vor 10 Minuten", und ein
 * Verfolger konnte daraus zwei voellig verschiedene Lagen nicht unterscheiden:
 * jemand macht Pause, oder das Telefon ist tot. Fuer eine Notfall-App ist das
 * genau der falsche Moment fuer eine Mehrdeutigkeit, denn wer auf Rettung
 * wartet, bewegt sich per Definition nicht.
 *
 * Bewusst ohne Expo-Abhaengigkeiten, damit die Regel fuer sich testbar bleibt.
 */
import type { TrackPoint } from '../../types/location';
import { distanceBetween } from './trackStats';

/**
 * Innerhalb dieses Umkreises gilt jemand als "nicht von der Stelle bewegt".
 *
 * Nicht zu klein waehlen: Die Position zappelt auch im Stand um einige Meter,
 * und jeder Zappler wuerde den Stillstand sonst zuruecksetzen - die Meldung
 * erschiene nie. Nicht zu gross waehlen: Auf derselben Tour ist Stephan
 * waehrend der Rast in einem Umkreis von 800 Metern umhergegangen, und das war
 * echte Bewegung, die nicht als Stillstand durchgehen darf.
 */
export const STANDSTILL_RADIUS_METERS = 25;

/**
 * So lange muss jemand am Fleck geblieben sein, bevor der Live-Link es meldet.
 *
 * Kuerzer waere ein Hinweis bei jeder Trinkpause, und ein Hinweis, der staendig
 * kommt, wird nicht mehr gelesen.
 */
export const STANDSTILL_NOTICE_AFTER_MS = 5 * 60 * 1000;

/**
 * Seit wann sich der letzte Punkt nicht mehr aus seinem Umkreis entfernt hat.
 *
 * Gibt den Zeitstempel des fruehesten Punktes zurueck, der noch im Umkreis des
 * letzten liegt - also den Moment des Ankommens. null, wenn es weniger als zwei
 * Punkte gibt.
 *
 * Gemessen wird gegen den LETZTEN Punkt, nicht entlang der Kette: Sonst wuerde
 * eine langsame Wanderung, bei der jeder Schritt unter dem Umkreis bleibt, als
 * Stillstand gelten, obwohl die Person laengst woanders ist.
 *
 * @param points Punkte in zeitlicher Reihenfolge, aelteste zuerst
 */
export function stationarySince(
  points: TrackPoint[],
  radiusMeters: number = STANDSTILL_RADIUS_METERS,
): number | null {
  if (points.length < 2) return null;

  const letzter = points[points.length - 1];
  let seit = letzter.timestamp;

  for (let i = points.length - 2; i >= 0; i -= 1) {
    if (distanceBetween(letzter, points[i]) > radiusMeters) break;
    seit = points[i].timestamp;
  }

  return seit === letzter.timestamp ? null : seit;
}

/**
 * Ob der Stillstand lange genug dauert, um ihn zu melden.
 *
 * `now` wird uebergeben statt Date.now() zu rufen, damit die Regel testbar
 * bleibt.
 */
export function isStandstill(
  since: number | null,
  now: number,
  minimumMs: number = STANDSTILL_NOTICE_AFTER_MS,
): boolean {
  if (since === null) return false;
  return now - since >= minimumMs;
}
