# Was vier Vergleichsmessungen zutage gefördert haben

Zwischen dem 27. September und dem 3. Oktober 2026 lief NaturlustTrailGuide viermal auf einer echten Tour parallel zu Vergleichsgeräten mit. Aus diesen Messungen sind die Versionen 1.0.1 bis 1.0.4 entstanden. Dieses Dokument hält fest, was dabei gefunden wurde – nicht als Versionshinweise, sondern als Nachweis, wie die Fehler entdeckt wurden und warum die gewählte Lösung die richtige ist.

Die Reihenfolge ist nach Schwere sortiert, nicht chronologisch. Die gravierendsten Funde standen in keinem Testplan – sie kamen heraus, weil eine Zahl nicht passte.

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

## 10. Höhenmeter um das Sechzehnfache zu hoch

**Schwere:** Angezeigte Tourdaten frei erfunden
**Gefunden:** 01.10.2026, dritte Vergleichsmessung (Wanderung, 30.09.2026)
**Behoben in:** 1.0.3

### Symptom
Für eine zweistündige Wanderung über 4,2 Kilometer meldete die App **+496 / −496 Höhenmeter**. Die Garmin-Referenz wies **+30 / −40** aus. Die Strecke dagegen stimmte fast: 4,18 gegen 4,24 Kilometer.

### Ursache
Die Schwelle von 10 Metern aus 1.0.2 war aus der Praxis barometrischer Höhenmesser übernommen – für GPS ist sie viel zu niedrig. Gemessen lag der Höhenfehler bei **11,5 Metern Standardabweichung** mit Ausschlägen von −39 bis +32 Metern. Zappeln in dieser Größenordnung passiert eine 10-Meter-Schwelle ungehindert, und weil jeder Aufwärtsschritt zählt, summiert es sich über zwei Stunden zu einer Bergtour, die nie stattgefunden hat.

### Was dabei zusätzlich herauskam
Der Höhenfehler ist **kein weißes Rauschen, sondern eine träge Drift**. Die Autokorrelation des Fehlers lag von einem Punkt zum nächsten bei 0,74, bei fünf Punkten Abstand noch bei 0,52. Der Wert ist also über eine halbe Minute hinweg in dieselbe Richtung verzogen. Das erklärt, warum eine höhere Schwelle allein nicht reicht: Für sie sieht eine langsame Verschiebung um 25 Meter genauso aus wie ein echter Anstieg.

Nebenbei fiel ein systematischer Versatz von **+38,8 Metern** gegenüber der Referenz auf. Das ist keine Fehlfunktion, sondern die Geoidundulation: Android meldet die Höhe über dem WGS84-Ellipsoid, Karten und Wander-Apps rechnen über dem Meeresspiegel. Bei 47,3° Nord und 11,2° Ost liegen dazwischen rund 48 Meter. Auf die Höhen*differenz* wirkt sich das nicht aus, auf eine absolute Höhenangabe sehr wohl – deshalb zeigt die App keine an. Der `<ele>`-Wert im GPX-Export trägt diesen Versatz allerdings.

### Lösung
Zwei Dinge zusammen, geprüft an drei Fällen:

1. **Glättung über zwei Minuten vor der Summierung.** Das Mittelungsverfahren wurde nicht geraten, sondern ausgewählt. Der naheliegende gleitende Median hat eine Schwäche, die genau bei diesem Signal auftritt: Wechselt die Höhe regelmäßig zwischen zwei Werten, enthält das Fenster von beiden gleich viele, und der Median springt mit, statt zu mitteln – in der Prüfung mit einem symmetrischen Wechsel um ±20 Metern auf ebener Strecke meldete er 1120 Höhenmeter. Der einfache Mittelwert löst das, lässt sich aber von einem einzelnen groben Wert mitziehen. Gewählt wurde der **getrimmte Mittelwert**: erst die extremen 20 Prozent oben und unten wegwerfen, dann mitteln.
2. **Schwelle von 10 auf 30 Meter.**

| Verfahren | Wanderung (soll +30) | Kunstberg (soll +800) | Zickzack (soll 0) |
|---|---|---|---|
| Median 120 s | 74 m | 772 m | 1120 m |
| Mittelwert 120 s | 65 m | 747 m | 0 m |
| **getrimmter Mittelwert 120 s** | **32 m** | **758 m** | **0 m** |

### Warum ein Kunstberg
Auf einer flachen Wanderung lässt sich jedes Verfahren gut aussehen – es muss nur alles verwerfen. Die Gefahr ist die umgekehrte: ein Verfahren, das auf der Wiese stimmt und am Berg die Hälfte schluckt. Weil keine Bergtour als Messung vorliegt, wurde eine konstruiert: dieselben Zeitstempel und dasselbe gemessene Rauschen wie bei der echten Wanderung, aber ein Höhenprofil mit 800 echten Höhenmetern. Dort meldet das gewählte Verfahren 758 Meter, also vier Prozent zu wenig. Der Fehler ist auf flachem Gelände absolut klein und am Berg anteilig klein – und er geht nach unten statt nach oben, was die ehrlichere Richtung ist.

---

## 11. Ein einzelner Punkt, 83 Prozent des Streckenfehlers

**Schwere:** Streckenangabe und Live-Standort verfälscht
**Gefunden:** 01.10.2026, dritte Vergleichsmessung
**Behoben in:** 1.0.3

### Symptom
Gegen die volle Referenz wich die Strecke nur um −1,3 Prozent ab. Wie schon bei der zweiten Messung täuscht diese Zahl: Dünnt man die Referenz auf unseren Punktabstand von 11,9 Sekunden aus, lautet der Zielwert 3,90 statt 4,24 Kilometer – und die tatsächliche Abweichung ist **+7,1 Prozent**.

### Ursache
Von 385 Punkten war genau **einer** schlecht. Er wurde mit 47,4 Metern Genauigkeit gemeldet und lag damit knapp unter der damaligen Grenze von 50. Zwei aufeinanderfolgende Segmente führten zu ihm hin und wieder zurück: 118,7 Meter in 9,3 Sekunden, dann 136,5 Meter in 9,5 Sekunden – 46 und 52 km/h auf einer Wanderung. Zusammen 255 Meter, die nie gegangen wurden: **83 Prozent des gesamten Streckenfehlers**.

Die Plausibilitätsprüfung aus 1.0.2 griff nicht, weil ihre Grenze bei 90 km/h liegt. Sie ist bewusst so großzügig, damit eine Abfahrt auf dem Rennrad keine zerhackte Spur ergibt – für eine Wanderung ist das wirkungslos.

### Lösung
Der Genauigkeitsfilter wurde **für die Aufzeichnung** von 50 auf 30 Meter verschärft. Damit fällt der Punkt weg, und die Abweichung sinkt von +7,1 auf **+1,2 Prozent**. Noch strenger zu filtern bringt nichts mehr und kostet Punkte: Bei 12 Metern wären 35 statt 2 verworfen worden, bei kaum verändertem Ergebnis.

**Beim Teilen eines einzelnen Standorts bleibt es bei 50 Metern.** Die beiden Fälle sehen gleich aus, sind es aber nicht: Ein geteilter Standort hat keine Alternative – was da ist, wird geteilt, der Anrufer wartet jetzt. Ein Spurpunkt hat hunderte Geschwister, und der nächste kommt in zehn Sekunden. Ihn wegzuwerfen kostet nichts.

### Was dabei nicht kaputtging
Bleibt der Empfang längere Zeit schlecht, greift weiterhin die Fünf-Minuten-Regel aus 1.0.1: Dann wird auch ein grober Punkt übernommen und mit seiner Genauigkeit gespeichert. Die Spur wird in schlechtem Gelände also dünner, sie reißt nicht ab.

---

## 12. Der Live-Link steht still, wenn die Person still steht

**Schwere:** Verfolger kann Rast nicht von totem Telefon unterscheiden
**Gefunden:** 03.10.2026, vierte Vergleichsmessung (Bergtour)
**Behoben in:** 1.0.4

### Symptom
Während einer dreistündigen Rast lieferte Android nur alle 60 bis 630 Sekunden einen Standort. Der Live-Link zeigte in dieser Zeit „Aktualisiert vor 10 Minuten" – und sonst nichts.

### Ursache
Kein Fehler, sondern eine Folge des Mindestabstands von 10 Metern: Wer sich nicht bewegt, löst keine neue Messung aus. Das ist für die Spur richtig und spart Strom. Für den Live-Link ist es fatal, weil zwei grundverschiedene Lagen identisch aussehen: Jemand macht Pause – oder das Telefon ist aus.

Für eine Notfall-App ist das die denkbar ungünstigste Mehrdeutigkeit. **Wer auf Rettung wartet, bewegt sich per Definition nicht.** Genau im Ernstfall sieht der Verfolger also das Bild, das auch ein ausgefallenes Gerät erzeugt.

### Lösung
Die App schickt mit jedem Standort, seit wann die Position unverändert ist (`stationarySince`). Bleibt jemand länger als fünf Minuten in einem Umkreis von 25 Metern, zeigt die Seite:

> **Person bewegt sich nicht.** Position seit 13:28 Uhr unverändert (seit 2 Std. 18 Min.).

Zwei Entwurfsentscheidungen dahinter:

**Gemessen wird gegen den letzten Punkt, nicht entlang der Kette.** Sonst gälte eine langsame Wanderung, bei der jeder Schritt unter dem Umkreis bleibt, als Stillstand – und ein Verfolger wäre in falscher Sicherheit.

**Der Hinweis hängt nicht an neuen Übertragungen.** Er steht in den zuletzt übertragenen Daten und bleibt sichtbar, auch wenn die App zehn Minuten lang nichts senden kann. Das ist wichtig, denn genau in dieser Lage kommt ja nichts Neues.

### Warum 25 Meter
An der Tour durchgerechnet. Bei **15 m** zerfällt die dreistündige Rast in Bruchstücke, weil das Zappeln der Position im Stand den Stillstand immer wieder zurücksetzt. Bei **40 m** zieht der ungenaue erste Punkt der Tour (gemeldet mit 93 m, tatsächlich 129 m daneben) Phasen zusammen, die nicht zusammengehören. Bei **25 m** liefert das Verfahren sechs Phasen, deren längste exakt die Rast von 13:28 bis 15:47 Uhr abdeckt.

---

## 13. Höhenmeter immer noch 27 Prozent zu hoch

**Schwere:** Angezeigte Tourdaten zu hoch, aber nicht mehr absurd
**Gefunden:** 03.10.2026, vierte Vergleichsmessung
**Teilweise behoben; die eigentliche Arbeit steht aus**

### Symptom
Für eine Bergtour mit tatsächlich +244 Höhenmetern meldete die App **+311**. Das alte Verfahren aus 1.0.2 hätte **+465** ergeben – die Glättung aus 1.0.3 hat also zwei Drittel des Fehlers weggenommen, aber nicht alles.

Dass sie grundsätzlich arbeitet, zeigt die Rast: Über drei Stunden am selben Fleck meldet 1.0.3 **+0 Höhenmeter**, das alte Verfahren hätte +25 erfunden. Auch die Bilanz schließt sauber – +311/−308 bei einer Rundtour, die auf 1017 m beginnt und auf 1014 m endet.

### Ursache
Drei Höhensprünge von **127 bis 136 Metern**, jeder binnen einer Minute, bei einer horizontalen Bewegung von weniger als einem Meter. Gemeldet wurden sie mit einer Genauigkeit von **2 bis 5 Metern** – den besten Werten, die die Tour zu bieten hatte.

Das ist dieselbe Lektion wie bei den Fehlortungen im September, eine Dimension weiter: **Die horizontale Genauigkeit sagt über den Höhenfehler nichts aus.** Unsere Filter können diese Punkte deshalb prinzipiell nicht erkennen.

### Was dabei bewusst NICHT getan wurde
Die naheliegende Reaktion wäre, Fenster und Schwelle nachzustellen, bis die 311 auf 244 fallen. Durchgerechnet:

| Fenster | Schwelle | Ergebnis |
|---|---|---|
| 120 s | 30 m | +311 m |
| 120 s | 40 m | +320 m |
| 180 s | 30 m | +287 m |
| 180 s | 40 m | +320 m |

**Das ist nicht monoton.** Strenger einzustellen macht es mal besser, mal schlechter. Dasselbe beim Aussortieren der Ausreißer: eine Grenze von 60 m bringt +286, eine von 40 m wieder +312. Unterschiede, die sich so verhalten, sind kein Signal, sondern Rauschen – wer hier das beste Paar heraussucht, passt die App an eine einzige Tour an und verschlechtert sie auf der nächsten.

### Lösung für 1.0.4, und was danach kommt
Android liefert für die Höhe eine **eigene Unsicherheit** mit (`altitudeAccuracy`), und wir haben sie bisher weggeworfen. Seit 1.0.4 steht sie in der Datenbank und im GPX-Export – **ausgewertet wird sie noch nicht.** Erst wenn aus einer echten Tour hervorgeht, wie verlässlich Android sie meldet, lässt sich entscheiden, ob sie als Filter taugt. Das ist der offene Punkt für die fünfte Messung.

### Nebenbefund: ein systematischer Versatz von 44 Metern
Unsere Höhenspanne (1006–1197 m) liegt rund 44 Meter über der der Referenz (962–1150 m), bei praktisch gleicher Spannweite (192 gegen 188 m). Das ist keine Fehlfunktion, sondern die Geoidundulation – Android misst über dem WGS84-Ellipsoid, Karten rechnen über dem Meeresspiegel. Auf die Höhen*differenz* wirkt sich das nicht aus, auf eine absolute Angabe sehr wohl. Die App zeigt keine an; der `<ele>`-Wert im GPX-Export trägt den Versatz allerdings.

---

## 14. Kleinere Lücken, die bei der Auswertung störten

| Lücke | Wirkung | Lösung |
|---|---|---|
| Keine Höhendaten gespeichert | Von 215 Punkten einer Radtour hatte kein einziger eine Höhenangabe, die Referenz wies +400/−380 m aus | Spalte ergänzt, Höhenmeter zunächst mit 10-Meter-Schwelle – die sich dann als viel zu niedrig erwies, siehe Punkt 10 |
| Genauigkeit fehlte im GPX-Export | Bei der Auswertung ließ sich nicht klären, welche Genauigkeit die Ausreißer gemeldet hatten – der Wert lag in der Datenbank, aber nicht in der Datei | Eigener Namensraum in `<extensions>` |
| Geteilter Standort ohne Genauigkeitsangabe | Der Empfänger konnte einen auf 5 Meter genauen Standort nicht von einem 300 Meter danebenliegenden unterscheiden | Genauigkeit steht in der Nachricht, bei schlechtem Empfang als Warnung mit Umkreis |
| Erster Fix wurde ungeprüft verschickt | Der erste Standort nach dem Aufwachen ist oft der zuletzt bekannte oder eine Funkzellen-Schätzung | Kurzes Warten auf einen brauchbaren Fix, auf zwölf Sekunden begrenzt |
| Nur Dauer und Punktzahl in der Aktivitätsliste | „215 GPS-Punkte" sagt über eine Tour nichts aus | Streckenlänge und Höhenmeter, aus vorhandenen Daten berechnet |
| GPX-Export ohne Tests | Die Elementreihenfolge in GPX 1.1 ist schemarelevant und war ungeprüft | Neun Tests ergänzt |

---

## Was in der dritten Messung nicht schiefging

Ein Fehlerbericht, der nur Fehler aufzählt, verzerrt das Bild. Drei Dinge wurden in derselben Messung geprüft und hielten stand:

**Der geteilte Standort – die Angabe, auf die es im Ernstfall ankommt.** Während der Tour wurden viermal Koordinaten geteilt. Gegen die Referenz lagen sie 3,6 / 6,6 / 7,9 und 30,8 Meter daneben. Dreimal davon war die App näher an der Wahrheit als die Garmin-Uhr. Die Zeitstempel ließen sich unabhängig bestätigen: Das Batterieprotokoll zeigt Bildschirmaktivität um 17:29, 17:36, 17:53 und 18:48 – genau zu den vier gemeldeten Uhrzeiten.

**Der Akkuverbrauch nach der Umstellung auf den Zehn-Sekunden-Takt.** 65 auf 51 Prozent in 1 Stunde 58 Minuten, also **7,1 Prozent pro Stunde**. Der Bildschirm war dabei 94 Prozent der Zeit aus; nach dem Beenden der Tour sank der Stand bei eingeschaltetem Bildschirm mit 16 Prozent pro Stunde mehr als doppelt so schnell. Gegenüber dem Dreißig-Sekunden-Takt der Vorversion (rund 6 Prozent pro Stunde) kostet die Verdreifachung der Messrate also etwa einen Prozentpunkt pro Stunde. Der Grund ist naheliegend, wenn man ihn einmal gesehen hat: Der Satellitenempfänger läuft während einer Aktivität ohnehin durchgehend. Ihn häufiger abzufragen ändert wenig; ihn überhaupt einzuschalten ist der teure Teil.

**Der Vordergrunddienst lief durch.** 17:15:19 bis 19:13:16 ohne eine einzige Unterbrechung, nachgewiesen über `dumpsys batterystats --history`. Die Warnung „Dein Standort wird gerade NICHT aufgezeichnet" aus 1.0.2 erschien nicht – also auch kein Fehlalarm.

---

## Was diese Messungen methodisch gezeigt haben

**Ein Referenzgerät ist unverzichtbar.** Beide gravierenden Messfehler wären ohne Vergleichstrack nie aufgefallen. Die App für sich betrachtet sah in beiden Fällen plausibel aus.

**Ein gutes Ergebnis ist kein Beweis.** Die 2,3 Prozent der zweiten Messung sahen nach Erfolg aus und waren in Wahrheit zwei Fehler, die sich aufhoben. Erst die Gegenprobe bei gleichem Punktabstand brachte es ans Licht. Bei der dritten Messung wiederholte sich das Muster: −1,3 Prozent auf dem Papier, +7,1 Prozent in Wahrheit.

**Eine gute Zahl in der einen Größe sagt nichts über die andere.** Die dritte Messung hatte die bis dahin beste Streckenangabe und gleichzeitig eine Höhenangabe, die um das Sechzehnfache danebenlag. Beides stammt aus demselben Datenstrom. Wer nur die Kilometer prüft, hält eine App für richtig, die eine Bergtour erfindet.

**Eine gute Zahl kann die falsche Reaktion auslösen.** Die vierte Messung lieferte mit −2,6 % die beste Streckenangabe und gleichzeitig eine Höhenangabe, die 27 % zu hoch lag. Die Versuchung, an den Parametern zu drehen, bis auch die zweite Zahl stimmt, war groß – und falsch. Die Parametersuche verhielt sich nicht monoton, und das ist das Erkennungszeichen dafür, dass man Rauschen optimiert und nicht den Fehler. Die richtige Antwort war, eine fehlende Messgröße nachzurüsten statt an den vorhandenen zu drehen.

**Ein Verfahren gegen einen einzigen Fall zu prüfen, reicht nicht.** Gegen die flache Wanderung allein hätte auch ein Verfahren gut ausgesehen, das am Berg die Hälfte verschluckt – es muss ja nur genug wegwerfen. Erst der zweite, konstruierte Fall mit 800 echten Höhenmetern und derselben Rauschcharakteristik zeigt, ob das Verfahren trennt oder nur unterdrückt. Und erst ein dritter, bewusst bösartiger Fall deckte auf, dass ausgerechnet der naheliegende gleitende Median bei regelmäßigem Wechsel zwischen zwei Werten versagt.

**Die schwersten Funde standen in keinem Testplan.** Das Cloud-Backup und die Aktivität ohne Aufzeichnung kamen beide heraus, weil beim Prüfen von etwas anderem eine Zahl nicht passte.

**Das Batterieprotokoll des Geräts ist das verlässlichste Werkzeug.** `dumpsys batterystats --history` führt tagelang Buch über Vordergrunddienste und überlebt sogar die Deinstallation der App. Es hat bewiesen, dass die App nicht heimlich mitgezeichnet hat – und damit den Blick auf die richtige Ursache gelenkt.

**Nicht jede Vermutung hält.** Drei Erklärungsansätze wurden im Verlauf verworfen, nachdem die Daten ihnen widersprachen: das Stillstandszappeln, die Mindestdistanz je Segment und die Mittelung über mehrere Messungen. Jeder davon wäre plausibel gewesen.
