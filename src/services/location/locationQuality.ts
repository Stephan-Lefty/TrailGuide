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
 * Dieselbe Frage fuer die aufgezeichnete Spur - und dort faellt die Abwaegung
 * strenger aus.
 *
 * Ein geteilter Standort hat keine Alternative: Was da ist, wird geteilt, auch
 * wenn es grob ist, denn der Anrufer wartet jetzt. Ein Spurpunkt dagegen hat
 * hunderte Geschwister, und der naechste kommt in zehn Sekunden. Ihn
 * wegzuwerfen kostet nichts, ihn zu behalten kann teuer werden.
 *
 * Wie teuer, zeigte die Wanderung am 30.09.2026. Von 385 Punkten war genau
 * einer schlecht - gemeldet mit 47,4 m und damit knapp unter der Grenze
 * darueber. Dieser eine Punkt lag so weit abseits, dass Hin- und Rueckweg zu
 * ihm 255 m ergaben: 83 % des gesamten Streckenfehlers der Tour. Ihn
 * auszusortieren bringt die Abweichung gegen die ausgeduennte Referenz von
 * +7,1 % auf +1,2 %. Noch strenger zu filtern bringt nichts mehr, kostet aber
 * Punkte: Bei 12 m waeren es 35 statt 2 gewesen.
 *
 * Bleibt der Empfang laenger schlecht, greift FORCE_RECORD_AFTER_MS auch hier.
 * Die Spur reisst also nicht ab, sie wird nur duenner.
 */
export const MAX_RECORDING_ACCURACY_METERS = 30;

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
  if (accuracy <= MAX_RECORDING_ACCURACY_METERS) return true;
  // Noch gar nichts aufgezeichnet: Der erste Punkt zaehlt in jedem Fall, sonst
  // stuende zu Beginn einer Tour bei schlechtem Empfang ueberhaupt nichts zur
  // Verfuegung.
  if (lastRecordedAt === null) return true;
  return timestamp - lastRecordedAt >= FORCE_RECORD_AFTER_MS;
}

/**
 * Mindestabstand zwischen zwei Uebertragungen an den Live-Link.
 *
 * Aufgezeichnet wird seit 1.0.2 alle 10 Sekunden, weil die Spur sonst die
 * Kurven abschneidet. Jeden dieser Punkte auch zu uebertragen wuerde die Zahl
 * der Netzabfragen verdreifachen - und die Funkverbindung kostet mehr Strom
 * als der GPS-Empfaenger. Gemessen lag der Verbrauch bei 30-Sekunden-Takt bei
 * rund 6 % pro Stunde; auf einer Tagestour ist das der Unterschied zwischen
 * ankommen und nicht ankommen.
 *
 * Fuer die Verfolgung aendert sich dadurch nichts: Der Live-Link war auch
 * vorher auf halbe Minute genau.
 */
export const MIN_PUSH_INTERVAL_MS = 30 * 1000;

/**
 * Ob ein Standort jetzt an den Live-Link gehen soll.
 *
 * Beim ersten Punkt nach dem Start (lastPushedAt === null) wird immer
 * uebertragen - wer den Link gerade geteilt hat, soll nicht eine halbe Minute
 * auf die erste Position warten.
 */
export function shouldPushToRelay(lastPushedAt: number | null, timestamp: number): boolean {
  if (lastPushedAt === null) return true;
  return timestamp - lastPushedAt >= MIN_PUSH_INTERVAL_MS;
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
