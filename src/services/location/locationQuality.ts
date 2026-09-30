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

/**
 * Hoechste Geschwindigkeit, die noch als echte Bewegung gelten kann.
 *
 * Grosszuegig angesetzt: Eine Abfahrt auf dem Rennrad oder mit Ski erreicht
 * 70 bis 80 km/h, und wer im Zug oder Auto sitzt, soll keine zerhackte Spur
 * bekommen. Es geht nur darum, physikalisch unmoegliche Werte abzufangen.
 */
export const MAX_PLAUSIBLE_SPEED_KMH = 90;

/**
 * So lange darf eine Luecke hoechstens sein, damit ueber den naechsten Punkt
 * geurteilt wird. Nach einem Tunnel oder einer Funkpause ist ein weiter Sprung
 * echt und darf nicht als Fehler gelten.
 */
export const MAX_JUDGED_GAP_MS = 2 * 60 * 1000;

/**
 * Nach so vielen Verwerfungen hintereinander wird wieder angenommen.
 *
 * Das ist die wichtigste Sicherung des Verfahrens: Geurteilt wird immer gegen
 * den letzten angenommenen Punkt. War dieser selbst der Ausreisser, wuerde ohne
 * diese Grenze jeder folgende - korrekte - Punkt als unmoeglich gelten und die
 * Aufzeichnung ab dort abreissen. Lieber drei fragwuerdige Punkte aufnehmen als
 * den Rest einer Tour verlieren.
 */
export const MAX_CONSECUTIVE_REJECTS = 3;

/**
 * Prueft, ob ein Standort vom letzten angenommenen aus ueberhaupt erreichbar war.
 *
 * Der Genauigkeitsfilter oben greift nur, wenn das Geraet seine Unsicherheit
 * selbst zugibt. Genau das tut es nicht immer: Bei der Radtour am 29.09.2026
 * kamen Spruenge von 470 bis 834 Metern durch, gemeldet mit unauffaelliger
 * Genauigkeit - der groesste entsprach 163 km/h auf dem Fahrrad. Solche
 * Fehlortungen (WLAN-Ortung auf einen entfernten Zugangspunkt, Reflexionen in
 * engen Taelern) sind nur an der Bewegung zu erkennen, nicht an der gemeldeten
 * Qualitaet.
 *
 * Verworfen wird der PUNKT, nicht die Teilstrecke: Faellt ein Ausreisser weg,
 * wird die Strecke vom letzten guten Punkt zum naechsten guten gemessen. Wuerde
 * man stattdessen das Segment verwerfen, zaehlte die Strecke zwischen zwei
 * echten Orten als null - auf derselben Tour hat das die Gesamtlaenge von
 * 21,8 auf 14,1 km gedrueckt.
 *
 * @param distanceMeters Entfernung zum letzten angenommenen Punkt
 * @param elapsedMs      Zeit seit dem letzten angenommenen Punkt
 * @param consecutiveRejects Wie viele Punkte unmittelbar davor verworfen wurden
 */
export function isPlausibleMove(
  distanceMeters: number,
  elapsedMs: number,
  consecutiveRejects: number,
): boolean {
  if (consecutiveRejects >= MAX_CONSECUTIVE_REJECTS) return true;
  // Ohne verstrichene Zeit ergibt die Geschwindigkeit keinen Wert. Zwei Punkte
  // mit demselben Zeitstempel kommen vor, wenn Android gepufferte Standorte
  // gebuendelt nachliefert.
  if (elapsedMs <= 0) return true;
  if (elapsedMs > MAX_JUDGED_GAP_MS) return true;

  const speedKmh = (distanceMeters / (elapsedMs / 1000)) * 3.6;
  return speedKmh <= MAX_PLAUSIBLE_SPEED_KMH;
}
