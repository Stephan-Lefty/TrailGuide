import { MAX_ACCURACY_METERS } from './locationQuality';

/**
 * Wie lange hoechstens auf einen besseren Standort gewartet wird, bevor der
 * beste bisherige verschickt wird.
 *
 * Der erste Standort, den Android nach dem Aufwachen liefert, ist oft der
 * zuletzt bekannte oder eine Funkzellen-Schaetzung. Ein paar Sekunden spaeter
 * steht meist ein echter Satellitenfix. Dieses Fenster ist bewusst kurz: Im
 * Ernstfall darf die Nachricht nicht an einer Wartezeit haengen. Verschickt
 * wird in jedem Fall etwas - notfalls der grobe Standort, dann aber als
 * solcher gekennzeichnet.
 */
export const MAX_WAIT_FOR_FIX_MS = 12_000;

/** So oft wird innerhalb des Fensters nachgefragt. */
export const FIX_RETRY_INTERVAL_MS = 2_000;

export type AccuracyQuality = 'good' | 'rough' | 'unknown';

/**
 * Teilt die gemeldete Genauigkeit in die Stufen ein, die in der Nachricht
 * unterschieden werden.
 *
 * Die Schwelle ist dieselbe wie beim Aufzeichnungsfilter: Oberhalb von
 * MAX_ACCURACY_METERS stammt der Standort erfahrungsgemaess nicht mehr aus
 * einem Satellitenfix.
 */
export function rateAccuracy(accuracy: number | null | undefined): AccuracyQuality {
  if (accuracy === null || accuracy === undefined || !Number.isFinite(accuracy)) {
    return 'unknown';
  }
  return accuracy <= MAX_ACCURACY_METERS ? 'good' : 'rough';
}

/**
 * Entscheidet, ob weiter auf einen besseren Standort gewartet werden soll.
 *
 * Sobald ein brauchbarer Fix vorliegt, wird nicht weiter gewartet - wer den
 * Standort teilt, will ihn abschicken, nicht auf Nachkommastellen warten.
 */
export function shouldKeepWaiting(
  accuracy: number | null | undefined,
  elapsedMs: number,
): boolean {
  if (elapsedMs >= MAX_WAIT_FOR_FIX_MS) return false;
  return rateAccuracy(accuracy) !== 'good';
}

/**
 * Rundet die Genauigkeit fuer die Anzeige auf eine Zahl, die man vorlesen kann.
 *
 * "auf etwa 12 m genau" hilft, "auf 12,384 m genau" behauptet eine Praezision,
 * die die Angabe selbst nicht hat.
 */
export function roundAccuracy(accuracy: number): number {
  if (accuracy < 20) return Math.round(accuracy);
  if (accuracy < 100) return Math.round(accuracy / 10) * 10;
  return Math.round(accuracy / 50) * 50;
}
