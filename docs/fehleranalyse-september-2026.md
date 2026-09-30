# Was zwei Vergleichsmessungen zutage gefördert haben

Zwischen dem 27. und dem 30. September 2026 lief NaturlustTrailGuide zweimal auf einer echten Tour parallel zu Vergleichsgeräten mit. Aus diesen beiden Messungen sind die Versionen 1.0.1 und 1.0.2 entstanden. Dieses Dokument hält fest, was dabei gefunden wurde – nicht als Versionshinweise, sondern als Nachweis, wie die Fehler entdeckt wurden und warum die gewählte Lösung die richtige ist.

Die Reihenfolge ist nach Schwere sortiert, nicht chronologisch. Die beiden gravierendsten Funde standen in keinem Testplan – sie kamen heraus, weil eine Zahl nicht passte.

---

## 1. Standortdaten lagen in Googles Cloud-Backup

**Schwere:** Widerspruch zwischen Zusage und Verhalten
**Gefunden:** 30.09.2026, beim Prüfen von etwas ganz anderem
**Behoben in:** 1.0.2

### Symptom
Nach einer vollständigen Deinstallation und Neuinstallation zeigte die App sofort wieder eine laufende Aktivität und den hinterlegten Notfallkontakt an. Das Onboarding wurde übersprungen. Laut System war die Installation drei Minuten alt.

### Ursache
`android:allowBackup="true"` stand im Manifest – der Android-Standardwert, den niemand aktiv gesetzt hatte. Das Betriebssystem sichert App-Daten damit automatisch im Google-Konto des Nutzers und spielt sie bei einer Neuinstallation zurück.

### Warum das schwer wiegt
Die Datenschutzerklärung sagt wörtlich zu, alle Standortdaten und Notfallkontakte würden „ausschließlich lokal in der App gespeichert". Tatsächlich lagen Standortspuren und Telefonnummern in einem Cloud-Backup. Für eine App, die sich gerade über Datensparsamkeit von etablierten Lösungen abgrenzt, ist das kein kosmetischer Mangel.

### Lösung
`allowBackup` abgeschaltet, im generierten Manifest und auf dem Gerät nachgeprüft (`flags=0x0`). Der Nachweis, dass es wirkt: Nach der Neuinstallation erscheint jetzt das Onboarding mit leeren Feldern.

Die Kehrseite ist bewusst in Kauf genommen und in beiden Datenschutzerklärungen benannt: Nach einem Gerätewechsel sind die Notfallkontakte weg und müssen neu eingetragen werden.

### Offen
Bei Geräten, auf denen 1.0.0 oder 1.0.1 lief, kann noch ein Backup im Google-Konto liegen. Das Abschalten verhindert neue Sicherungen, löscht aber keine alten.

---

## 2. Eine Aktivität konnte „aktiv" melden, ohne aufzuzeichnen

**Schwere:** gefährlichster denkbarer Zustand für eine Notfall-App
**Gefunden:** 30.09.2026, ausgelöst durch eine unerklärliche Datenbankleiche
**Behoben in:** 1.0.2

### Symptom
In der Datenbank stand eine Aktivität auf „aktiv", die niemand bewusst gestartet hatte. Das Batterieprotokoll des Geräts zeigte für den betreffenden Tag genau einen Vordergrunddienst – den der tatsächlichen Tour – und danach keinen einzigen mehr. Es gab also einen Eintrag ohne zugehörigen Dienst.

### Ursache
`startHike()` legte den Datenbankeintrag per `createHike()` an und rief erst danach `startBackgroundLocationTracking()`. Schlug der zweite Schritt fehl, blieb die Aktivität stehen. Der Nutzer landete auf dem Startbildschirm und las „Aktivität aktiv seit …", während in Wirklichkeit nichts aufgezeichnet wurde.

Verschärfend kam hinzu: `startLocationUpdatesAsync` lief ohne `try/catch`. Android kann das Anmelden von Standort-Updates ablehnen, ohne dass eine Berechtigung fehlt – die Ausnahme flog dann bis in den Aufrufer, sodass nicht einmal die Fehlermeldung erschien.

### Warum das schwer wiegt
Ein Start, der sichtbar scheitert, ist harmlos – man versucht es noch einmal. Einer, der scheitert und trotzdem Erfolg meldet, wiegt in Sicherheit. Wer sich auf die Anzeige verlässt und im Ernstfall feststellt, dass keine Spur existiert, ist schlechter dran als jemand, der gar nicht erst gestartet hat.

### Lösung
Dreifach abgesichert:

1. Die Ausnahme wird gefangen und zu einem sauberen `{success: false, reason: 'start_failed'}`.
2. Scheitert der Start, räumt `startHike()` die eben angelegte Aktivität per `deleteHike()` wieder weg. Bewusst löschen statt auf „beendet" setzen – eine Tour, die nie begonnen hat, gehört nicht in die Liste vergangener Touren.
3. Beim Wiederaufnehmen nach einem Prozess-Neustart lässt sich nicht löschen, dort können echte Punkte liegen. Stattdessen reicht der Hook den Zustand nach oben, und der Startbildschirm warnt in Rot: „Dein Standort wird gerade NICHT aufgezeichnet."

### Offen
Wie der konkrete Eintrag entstanden ist, ließ sich nicht mehr rekonstruieren – die Datenbank ging mit der Deinstallation verloren, bevor der Zusammenhang klar war. Lehre für künftige Fälle: bei einem unerklärlichen Zustand zuerst sichern, dann aufräumen.

---

## 3. Zwei aktive Aktivitäten gleichzeitig

**Schwere:** Datenverlust, Tour bricht scheinbar mitten im Lauf ab
**Gefunden:** 27.09.2026, ausgelöst durch eine in zwei Teile zerfallene Tour
**Behoben in:** 1.0.1

### Symptom
Eine Bergtour zerfiel in zwei Datensätze. Der erste Teil brach scheinbar mitten im Lauf ab, war in der App aber nicht mehr sichtbar – der Knopf stand nicht auf „Aktivität beenden".

### Ursache
`createHike()` schrieb die Datenbankzeile, *bevor* die Standortberechtigung abgefragt wurde. Android öffnet dafür eine eigene Systemseite und pausiert dabei die App, sodass der Code nach dem `await` nie ausgeführt wurde. Der Nutzer landete wieder auf dem Startbildschirm, tippte erneut – und hatte zwei aktive Aktivitäten. Da `getActiveHike()` nur die neueste liefert, wurde die ältere unsichtbar, und alle weiteren Punkte wanderten in die neuere.

### Lösung
Die Berechtigung wird jetzt zuerst eingeholt, erst danach entsteht ein Datenbankeintrag. Zusätzlich verhindert ein partieller Unique-Index (`WHERE status = 'active'`) den Zustand auf Datenbankebene – er ist technisch nicht mehr herstellbar, unabhängig davon, was der Code tut. Bestehende Altlasten werden bei der Migration als Vorfall markiert statt gelöscht; die Punkte sind möglicherweise die einzige Spur einer echten Tour.

Dazu ein zweistufiger Startbildschirm: Fehlt die Berechtigung, erklärt Schritt 1 den Zweck und bietet nur „Standortzugriff erlauben" an, ohne dass schon eine Aktivität entsteht. Nach der Rückkehr aus den Systemeinstellungen wechselt der Bildschirm von selbst auf Schritt 2.

---

## 4. Grobe Fehlortungen in Strecke und Live-Standort

**Schwere:** im Ernstfall mehrere hundert Meter falsche Position
**Gefunden:** 27.09.2026, durch Vergleich mit einer GPS-Uhr
**Behoben in:** 1.0.1

### Symptom
Die App zeichnete 21,95 km auf. Tatsächlich gelaufen waren 9,59 km.

### Ursache
Android drosselt im Hintergrund den GPS-Empfänger und greift auf Mobilfunk- und WLAN-Ortung zurück. Deren Schätzwerte erzeugen Sprünge von mehreren hundert Metern. 19 von 409 Segmenten überschritten 25 km/h und erzeugten allein 7,62 km Phantomstrecke – der größte Einzelsprung waren 673 Meter in 54 Sekunden. Die gemeldete Genauigkeit wurde zwar zu jedem Punkt gespeichert, aber nie ausgewertet.

### Lösung
Punkte mit einer gemeldeten Genauigkeit schlechter als 50 Meter werden verworfen. Bleibt der Empfang länger als fünf Minuten schlecht, wird trotzdem aufgezeichnet – ein ungenauer Standort ist im Notfall besser als eine Lücke. Er wird mit seiner Genauigkeit gespeichert und ist später als unsicher erkennbar.

---

## 5. Das Gerät verschweigt den Verlust des Satellitenfixes

**Schwere:** bis zu 245 Meter falsche Position bei unauffälliger Meldung
**Gefunden:** 30.09.2026, bei der Auswertung der zweiten Messung
**Behoben in:** 1.0.2

### Symptom
Fast das gesamte Rauschen der zweiten Tour steckte in einem einzigen Viertelstundenfenster – ausgerechnet der Standzeit. Über vier Minuten hinweg lag die aufgezeichnete Position durchgehend 50 bis 245 Meter neben der tatsächlichen.

### Ursache
Der Genauigkeitsfilter aus 1.0.1 greift nur, wenn das Gerät seine Unsicherheit selbst zugibt. Genau das tut es nicht immer: Die Sprünge kamen mit unauffälligen Genauigkeitswerten durch. Der größte entspräche 163 km/h auf dem Fahrrad.

### Was dabei widerlegt wurde
Die erste Vermutung lautete: Bei Stillstand zappelt die Position, und das summiert sich. Nachgemessen zeigt der Referenztrack in sieben Standphasen jedoch eine Streuung von unter drei Metern – **Stillstand an sich ist harmlos**. Auch eine Mindestdistanz je Segment half nicht: Selbst bei 40 Metern Schwelle blieben 0,80 von 1,02 km Phantomstrecke übrig. Es waren keine kleinen Zappler, sondern ein systematischer Versatz.

Ebenfalls geprüft und verworfen: Mittelung über mehrere Messungen. Sie verbessert den Fehler nur dort, wo ohnehin alles gut ist – gegen einen systematischen Versatz sind alle Messungen gleich falsch.

### Lösung
Eine Plausibilitätsprüfung, die den **Punkt** verwirft, nicht die Teilstrecke. Der Unterschied ist entscheidend: Fällt ein Ausreißer weg, wird die Strecke vom letzten guten Punkt zum nächsten guten gemessen. Würde man stattdessen das Segment verwerfen, zählte die Strecke zwischen zwei echten Orten als null – nachgerechnet drückt das die Tour von 21,8 auf 14,1 km.

Verworfen wird, was von der letzten guten Position aus nur mit über 90 km/h erreichbar gewesen wäre. Drei Sicherungen verhindern, dass der Filter selbst Schaden anrichtet:

- Nach über zwei Minuten Funkstille wird nicht geurteilt – nach einem Tunnel ist ein weiter Sprung echt.
- Nach drei Verwerfungen hintereinander wird wieder angenommen. Ohne diese Grenze würde die Aufzeichnung für den Rest der Tour abreißen, falls der Ankerpunkt selbst der Ausreißer war.
- Ohne verstrichene Zeit wird nicht geurteilt – gebündelt nachgelieferte Standorte tragen denselben Zeitstempel.

Auf dem sauberen Streckenabschnitt derselben Tour verwarf der Filter **keinen einzigen Punkt**. Wo nichts kaputt ist, macht er nichts kaputt.

### Warum das trotz geringer Wirkung auf die Kilometer gebaut wurde
Bei der Streckenlänge bringt der Filter nur 1,6 Prozentpunkte. Der Grund ist ein anderer: Diese Sprünge gingen bisher auch an den Live-Standort-Link. Ein Verfolger hätte die Position mehrere hundert Meter neben der Route gesehen.

---

## 6. Abgeschnittene Kurven – die täuschend gute Zahl

**Schwere:** systematische Messabweichung, verdeckt durch einen zweiten Fehler
**Gefunden:** 30.09.2026, durch Misstrauen gegenüber einem guten Ergebnis
**Behoben in:** 1.0.2

### Symptom
Die zweite Messung sah nach vollem Erfolg aus: 21,82 km gegenüber 22,33 km der Referenz, nur 2,3 Prozent Abweichung – nach 129 Prozent bei der ersten Messung.

### Was nicht stimmte
22 Segmente lagen über 40 km/h, eines davon bei 163 km/h. Das passte nicht zu einem fast perfekten Ergebnis.

Die Gegenprobe: Dünnt man den Referenztrack auf denselben Punktabstand aus, den die App verwendet, ergibt sich ein Sollwert von 20,72 km statt 22,33. Die schöne Zahl war die Summe zweier Fehler, die sich gegenseitig fast aufhoben:

| | |
|---|---|
| Kurven abschneiden | **−1,61 km** (−7,2 %) |
| verbliebenes Rauschen | **+1,10 km** (+5,3 %) |
| Summe | −0,51 km (−2,3 %) |

Der tatsächliche Messfehler betrug also +5,3 Prozent, nicht −2,3.

### Ursache
Bei 30 Sekunden Abstand liegen bei Radgeschwindigkeit über 150 Meter zwischen zwei Punkten. Jede Kurve dazwischen wird zur Geraden.

### Lösung
Der Abstand wurde auf 10 Sekunden verkürzt. Aus derselben Ausdünnungsreihe: Bei 10 Sekunden verliert der Referenztrack nur noch 2,8 Prozent statt 7,2. Fünf Sekunden wären 1,3 Prozent – 10 ist der Kompromiss zugunsten des Akkus.

### Merksatz
**Erst bei gleichem Punktabstand vergleichen.** Ohne die Gegenprobe wäre die Messung als „praktisch deckungsgleich" durchgegangen.

---

## 7. Der dreifache Akkuverbrauch, der beinahe eingebaut worden wäre

**Schwere:** hätte die Verbesserung aus Punkt 6 teuer erkauft
**Gefunden:** 30.09.2026, durch eine beiläufige Bemerkung zum Akkustand
**Behoben in:** 1.0.2, noch vor dem Release

### Symptom
Keines – der Fehler wäre erst im Gelände aufgefallen.

### Ursache
Die Verkürzung auf 10 Sekunden hätte bei aktivem Live-Standort-Link die Zahl der Netzabfragen verdreifacht. Die Funkverbindung kostet mehr Strom als der GPS-Empfänger, der bei durchgehender Aufzeichnung ohnehin läuft – unabhängig davon, wie oft die App das Ergebnis abholt.

Gemessener Ausgangswert: rund 6 Prozent Akku pro Stunde bei 30-Sekunden-Takt. Auf einer Achtstundentour sind das 35 bis 50 Prozent.

### Lösung
Aufzeichnung und Übertragung wurden entkoppelt: aufgezeichnet wird alle 10 Sekunden, übertragen weiterhin höchstens alle 30. Für die Verfolgung ändert sich nichts – der Link war auch vorher auf die halbe Minute genau. Der erste Punkt nach dem Teilen geht weiterhin sofort hinaus.

### Offen
Der Verbrauch bei 10 Sekunden ist noch nicht im Gelände gemessen. Erwartung: kein nennenswerter Anstieg, weil der teure Teil unverändert bleibt.

---

## 8. Der SOS-Knopf wäre hinter der Navigationsleiste verschwunden

**Schwere:** Notruf im Zweifel nicht erreichbar
**Gefunden:** 30.09.2026, beim Umsetzen einer Play-Console-Empfehlung
**Behoben in:** 1.0.2

### Ursache
Seit Android 15 zeichnen Apps grundsätzlich bis unter die Systemleisten. Die technische Voraussetzung war im Projekt gesetzt, die Lücke lag im Code: Ein `SafeAreaProvider` stand zwar bereit, aber **kein einziger Bildschirm hatte die Ränder je ausgewertet**. Unten wäre damit ausgerechnet der SOS-Knopf betroffen gewesen.

### Lösung
Eine `SafeAreaView` umschließt den gesamten Navigationsbereich und hält die untere Kante frei. Eine Stelle, wirkt für alle Bildschirme.

---

## 9. Der SOS-Knopf im Querformat

**Schwere:** Notruf im Querformat unerreichbar
**Gefunden:** 30.09.2026, durch gezieltes Nachprüfen einer Vermutung
**Behoben in:** 1.0.2

### Ursache
Ab Android 16 ignorieren Geräte mit großem Display eine feste Ausrichtung im Hochformat. Nachdem die Einschränkung entfernt wurde, reichte die Höhe im Querformat nicht mehr für den Inhalt – der Startbildschirm verteilte ihn über die volle Höhe. Am Gerät nachgeprüft: Bei 2670×1200 war nur bis „Aktivität aktiv seit …" zu sehen, der SOS-Knopf lag unterhalb der Kante.

### Lösung
Der Startbildschirm wurde scrollfähig gemacht (`flexGrow` statt `flex`, damit sich im Hochformat nichts ändert). Per Screenshot verifiziert: Der Knopf ist durch Wischen erreichbar.

### Offen
Im Querformat ist der Knopf erst nach dem Scrollen sichtbar. Ein eigenes, zweispaltiges Querformat-Layout wäre die saubere Lösung – sinnvoll, sobald es Rückmeldungen von Tablet-Nutzern gibt.

---

## 10. Kleinere Lücken, die bei der Auswertung störten

| Lücke | Wirkung | Lösung |
|---|---|---|
| Keine Höhendaten gespeichert | Von 215 Punkten einer Radtour hatte kein einziger eine Höhenangabe, die Referenz wies +400/−380 m aus | Spalte ergänzt, Höhenmeter mit 10-Meter-Schwelle gegen das Rauschen der GPS-Höhe |
| Genauigkeit fehlte im GPX-Export | Bei der Auswertung ließ sich nicht klären, welche Genauigkeit die Ausreißer gemeldet hatten – der Wert lag in der Datenbank, aber nicht in der Datei | Eigener Namensraum in `<extensions>` |
| Geteilter Standort ohne Genauigkeitsangabe | Der Empfänger konnte einen auf 5 Meter genauen Standort nicht von einem 300 Meter danebenliegenden unterscheiden | Genauigkeit steht in der Nachricht, bei schlechtem Empfang als Warnung mit Umkreis |
| Erster Fix wurde ungeprüft verschickt | Der erste Standort nach dem Aufwachen ist oft der zuletzt bekannte oder eine Funkzellen-Schätzung | Kurzes Warten auf einen brauchbaren Fix, auf zwölf Sekunden begrenzt |
| Nur Dauer und Punktzahl in der Aktivitätsliste | „215 GPS-Punkte" sagt über eine Tour nichts aus | Streckenlänge und Höhenmeter, aus vorhandenen Daten berechnet |
| GPX-Export ohne Tests | Die Elementreihenfolge in GPX 1.1 ist schemarelevant und war ungeprüft | Neun Tests ergänzt |

---

## Was diese Messungen methodisch gezeigt haben

**Ein Referenzgerät ist unverzichtbar.** Beide gravierenden Messfehler wären ohne Vergleichstrack nie aufgefallen. Die App für sich betrachtet sah in beiden Fällen plausibel aus.

**Ein gutes Ergebnis ist kein Beweis.** Die 2,3 Prozent der zweiten Messung sahen nach Erfolg aus und waren in Wahrheit zwei Fehler, die sich aufhoben. Erst die Gegenprobe bei gleichem Punktabstand brachte es ans Licht.

**Die schwersten Funde standen in keinem Testplan.** Das Cloud-Backup und die Aktivität ohne Aufzeichnung kamen beide heraus, weil beim Prüfen von etwas anderem eine Zahl nicht passte.

**Das Batterieprotokoll des Geräts ist das verlässlichste Werkzeug.** `dumpsys batterystats --history` führt tagelang Buch über Vordergrunddienste und überlebt sogar die Deinstallation der App. Es hat bewiesen, dass die App nicht heimlich mitgezeichnet hat – und damit den Blick auf die richtige Ursache gelenkt.

**Nicht jede Vermutung hält.** Drei Erklärungsansätze wurden im Verlauf verworfen, nachdem die Daten ihnen widersprachen: das Stillstandszappeln, die Mindestdistanz je Segment und die Mittelung über mehrere Messungen. Jeder davon wäre plausibel gewesen.
