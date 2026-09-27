/**
 * Beurteilt, ob ein vom Betriebssystem gemeldeter Standort gut genug ist, um
 * aufgezeichnet und geteilt zu werden.
 *
 * Bewusst als eigenes Modul ohne Expo-Abhaengigkeiten, damit die Regel fuer
 * sich testbar bleibt - der Hintergrund-Task daneben registriert sich beim
 * Laden global bei Android und laesst sich nicht sinnvoll isolieren.
 */

/**
 * Ab dieser gemeldeten Ungenauigkeit stammt ein Standort erfahrungsgemaess
 * nicht mehr aus einem echten Satellitenfix, sondern aus Mobilfunk- oder
 * WLAN-Ortung. Im Hintergrund drosselt Android das GPS, um Strom zu sparen,
 * und liefert dann regelmaessig solche Schaetzwerte. Ungefiltert erzeugen sie
 * Spruenge von mehreren hundert Metern: Bei einer Vergleichsmessung gegen eine
 * Garmin-Uhr kamen so 21,95 km statt der tatsaechlich gelaufenen 9,59 km
 * zustande - rund ein Drittel der Strecke stammte aus 19 solchen Ausreissern.
 * Schlimmer als die falsche Distanz ist die Folge fuer den Ernstfall: Ein
 * geteilter Standort kann damit mehrere hundert Meter daneben liegen.
 */
export const MAX_ACCURACY_METERS = 50;

/**
 * Bleibt der Empfang laenger schlecht, ist ein grober Standort immer noch
 * besser als gar keiner - die App soll im Ernstfall einen Anhaltspunkt liefern
 * koennen. Nach dieser Zeit ohne Aufzeichnung wird deshalb auch ein ungenauer
 * Punkt uebernommen. Er wird mit seiner Genauigkeit gespeichert, laesst sich
 * spaeter also als unsicher erkennen.
 */
export const FORCE_RECORD_AFTER_MS = 5 * 60 * 1000;

export function isUsableFix(
  accuracy: number | null | undefined,
  timestamp: number,
  lastRecordedAt: number | null,
): boolean {
  // Ohne Angabe laesst sich die Qualitaet nicht beurteilen - im Zweifel behalten.
  if (accuracy === null || accuracy === undefined) return true;
  if (accuracy <= MAX_ACCURACY_METERS) return true;
  // Noch gar nichts aufgezeichnet: Der erste Punkt zaehlt in jedem Fall, sonst
  // stuende zu Beginn einer Tour bei schlechtem Empfang ueberhaupt nichts zur
  // Verfuegung.
  if (lastRecordedAt === null) return true;
  return timestamp - lastRecordedAt >= FORCE_RECORD_AFTER_MS;
}
