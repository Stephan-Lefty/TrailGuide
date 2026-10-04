[Deutsch](README.md) | [English](README.en.md) | [Änderungsprotokoll](#änderungsprotokoll) | [Wichtiger Hinweis](#wichtiger-hinweis)

# NaturlustTrailGuide (NTG)

**Deine Sicherheit unterwegs. Deine Daten bleiben deine.**

Eine Sicherheits-App für Wanderer, Bergsteiger und Radfahrer: Standort-Tracking läuft nur während einer aktiven Tour, wird bei normalem Abschluss sofort und unwiderruflich gelöscht – und im Notfall stehen Notruf, Checkliste, Notfallkontakte und Standort-Teilen sofort bereit.

Mehr Infos, der vollständige Erklärtext und ein Kontaktformular: **[naturlust.net/trailguide-app](https://naturlust.net/trailguide-app/)**

---

## Grundprinzip

Startest du eine Aktivität, zeichnet die App im Hintergrund deinen Standort auf – auch bei gesperrtem Display. Kommst du sicher zurück, werden mit einem Klick alle Standortdaten sofort gelöscht. Es sammelt sich also **keine Bewegungshistorie** an. Nur wenn tatsächlich ein Vorfall vorlag, entscheidest du dich bewusst dafür, die Daten zu behalten.

## Features

- **Notruf ohne Umwege**: 112 immer verfügbar, plus automatisch erkannte, länderspezifische Bergrettungsnummer (aktuell AT, CH, SK, PL, CZ, IT, ES, BG) – die Ländererkennung funktioniert komplett **offline**. In Grenzregionen lässt sich das Land manuell übersteuern (Österreich/Schweiz).
- **Halten-Geste statt Antippen**: Ein Notruf wird erst nach 5 Sekunden bewusstem Halten ausgelöst – schützt vor Fehlbedienung.
- **W-Fragen-Checkliste**: Aufklappbare Erinnerung an die wichtigsten Angaben für den Notruf.
- **Notfallkontakte**: Bis zu zwei dauerhafte Kontakte (mindestens einer Pflicht) plus ein optionaler Kontakt nur für die aktuelle Tour.
- **Standort teilen**: Einmaliger Standort-Link oder ein laufend aktualisierter Live-Standort-Link über einen eigenen Relay-Server.
- **GPX-Export**: Aufgezeichnete Wegpunkte bei Vorfällen lassen sich als GPX-Datei per Mail versenden oder über beliebige Apps teilen.
- **SOS erst nach Tour-Start**: Der Notfall-Zugang ist gesperrt, solange keine Aktivität läuft – schließt versehentliche Notrufe aus.
- **Akku-Warnung**: Fällt der Akkustand während einer aktiven Tour unter 15%, meldet sich die App mit Ton.
- **Netz-wieder-da-Hinweis**: Nach einem Verbindungsverlust erinnert ein Hinweis mit Ton daran, sobald wieder Empfang da ist.
- **Neustart-Erinnerung**: Wurde das Gerät während einer laufenden Aktivität neu gestartet, erinnert eine Benachrichtigung daran, die App wieder zu öffnen und das Tracking fortzusetzen.
- **Mehrsprachig**: Deutsch/Englisch, automatisch nach Gerätesprache.

## Screenshots

| Ersteinrichtung | Aktive Tour | SOS-Screen |
|---|---|---|
| ![Onboarding](screenshots/01_onboarding.png) | ![Home aktiv](screenshots/05_home_aktiv.png) | ![SOS](screenshots/06_sos_oben.png) |

Weitere Screenshots mit Erklärungen im Ordner [`screenshots/`](screenshots/) und auf der [Projektseite](https://naturlust.net/trailguide-app/).

## Technischer Aufbau

- **App**: React Native / Expo (SDK 57), TypeScript, expo-router
- **Standort-Tracking**: expo-location + expo-task-manager (Hintergrund-Tracking)
- **Lokale Daten**: expo-sqlite (Touren, Kontakte, Wegpunkte), react-native-mmkv (Einstellungen)
- **Ländererkennung**: Natural-Earth-Länderdaten (1:50m) + Turf.js, vollständig offline
- **Live-Standort-Link**: Cloudflare Worker + Workers KV ([`server/`](server/))

## Entwicklung

```bash
npm install
cp .env.example .env   # ggf. anpassen
npm run android         # oder: npm run ios / npm start
npm test
```

### Relay-Server (Live-Standort-Link)

```bash
cd server
npm install
cp wrangler.toml.example wrangler.toml
npx wrangler kv namespace create LOCATION_KV   # ID in wrangler.toml eintragen
npm run dev              # lokale Entwicklung
npm run deploy           # Deployment zu Cloudflare
```

## Änderungsprotokoll

Bezieht sich auf die Versionsnummer der App (`app.json`/`package.json`).

### 1.0.5
Eine Rückfrage von Stephan nach der Radtour vom 04.10.2026 – „kann es sein, dass der Live-Standort immer noch geteilt wird?" – hat eine ganze Kette von Fehlern rund um den Live-Standort-Link aufgedeckt. Alle vier betrafen dasselbe Versprechen: dass eine Freigabe endet, wenn man sie beendet.
- **Der Live-Link überlebte das Beenden der Aktivität.** Die Aufzeichnung stoppte, die Standortpunkte wurden gelöscht, der Tourkontakt entfernt – nur der Link blieb auf dem Server, bis seine Laufzeit ablief: standardmäßig sechs Stunden. Er zeigte weiter die zuletzt übertragene Position. Für eine App, die zusagt, nach einer normalen Tour bleibe nichts zurück, war das derselbe Widerspruch wie seinerzeit das Android-Cloud-Backup.
- **Der Abschalt-Knopf war im Regelfall wirkungslos** – der schwerere der beiden Fehler. Hatte man den SOS-Bereich zwischendurch verlassen oder die App neu gestartet, zeigte sie gar keinen aktiven Link mehr an. Man wusste also nicht einmal, dass es etwas abzuschalten gab, und der Knopf dafür war verschwunden.
- **Das Starten konnte endlos hängen.** Beim Test auf einem Mobilfunknetz, in dem IPv6 unerreichbar war, brauchte der erste Serveraufruf **fünf Minuten**. Der Knopf zeigte die ganze Zeit „Wird gestartet…", ohne Rückmeldung und ohne Abbruch. Jetzt gilt der Versuch nach 20 Sekunden als gescheitert, der Knopf wird wieder bedienbar. Das Beenden wiederum wartet gar nicht mehr auf das Netz: Die App vergisst den Link sofort und schickt den Widerruf nebenher los.
- **Der erste Fehlversuch blieb stumm.** Die Meldung „Live-Tracking nicht verfügbar" erschien erst ab dem zweiten – ausgerechnet beim ersten, wo eine Erklärung am nötigsten ist, sprang der Knopf kommentarlos zurück.

Gefunden wurden die letzten beiden Punkte erst beim Durchspielen am echten Gerät. Die Tests davor waren grün und deckten die Logik ab – was sie nicht abdecken konnten, war ein Mobilfunknetz, auf dem der Server minutenlang nicht antwortet.

### 1.0.4
Ausgelöst durch die vierte Vergleichsmessung: eine sechsstündige Bergtour mit parallel laufender Garmin-Uhr (03.10.2026) – endlich eine mit echten Höhenmetern. Die Strecke war mit **−2,6 %** das beste Ergebnis bisher, die drei geteilten Standorte lagen 1,6 / 10,0 / 11,3 Meter neben der Referenz. Die Höhenangabe hat sich gegenüber 1.0.2 mehr als halbiert, stimmt aber noch nicht: +311 statt +244 Metern.
- **Die Höhengenauigkeit wird jetzt mitgeschrieben.** Sie steht in der Datenbank und im GPX-Export, wird aber noch nicht ausgewertet. Der Grund für diese Zurückhaltung steckt in den Messdaten: Dreimal sprang die gemeldete Höhe binnen einer Minute um 127 bis 136 Meter, während sich die Position um weniger als einen Meter bewegte und das Gerät eine *horizontale* Genauigkeit von 2 bis 5 Metern meldete. Diese Sprünge machen den Großteil der verbliebenen Abweichung aus, und mit der horizontalen Angabe allein sind sie nicht zu finden. Android liefert für die Höhe eine eigene Unsicherheit mit – bisher haben wir sie weggeworfen.
- **Bewusst nicht nachgestellt wurden die Glättungsparameter.** Die naheliegende Reaktion wäre, an Fenster und Schwelle zu drehen, bis die 311 auf 244 fallen. Durchgerechnet ergibt das: 120 s/30 m → +311, 120 s/40 m → +320, 180 s/30 m → +287, 180 s/40 m → +320. Das ist nicht monoton – strenger einzustellen macht es mal besser, mal schlechter. Solche Unterschiede sind kein Signal, sondern Rauschen, und wer hier das beste Paar heraussucht, passt die App an eine einzige Tour an. Erst messen, dann entscheiden.
- **Der Live-Link meldet jetzt Stillstand.** Wer sich nicht bewegt, löst keine neue Standortmessung aus – auf der Tour lieferte Android während der dreistündigen Rast nur alle 60 bis 630 Sekunden einen Punkt. Der Verfolger sah dann „Aktualisiert vor 10 Minuten" und konnte zwei völlig verschiedene Lagen nicht unterscheiden: jemand macht Pause, oder das Telefon ist tot. Für eine Notfall-App ist das die falsche Mehrdeutigkeit, denn wer auf Rettung wartet, bewegt sich per Definition nicht. Bleibt jemand länger als fünf Minuten in einem Umkreis von 25 Metern, steht auf der Seite jetzt: **„Person bewegt sich nicht. Position seit 13:28 Uhr unverändert (seit 2 Std. 18 Min.)."** Der Umkreis ist an der echten Tour geprüft – bei 15 Metern zerfällt die Rast in Bruchstücke, bei 40 Metern zieht der ungenaue erste Punkt der Tour alles zusammen.
- **Die Übertragung an den Live-Link erfolgt einmal je Messzyklus statt einmal je Punkt.** Android liefert gepufferte Standorte oft in Gruppen nach; bisher konnte ein langsamer Netzzugriff mitten in so einer Gruppe die Aufzeichnung der restlichen Punkte aufhalten. Übertragen wird jetzt immer die frischeste Position der Gruppe.

### 1.0.3
Ausgelöst durch die dritte Vergleichsmessung: eine zweistündige Wanderung mit parallel laufender Garmin-Uhr (30.09.2026) – die erste Messung mit nennenswerten Höhendaten. Die Strecke sah mit −1,3% gegen die Referenz gut aus, die Höhenangabe nicht: Die App meldete +496 Höhenmeter für eine Tour mit tatsächlich rund 30.
- **Die Höhenmeter waren um das Sechzehnfache zu hoch.** Die Schwelle von 10 Metern aus 1.0.2 stammte aus der Praxis barometrischer Höhenmesser und ist für GPS viel zu niedrig. Gemessen lag der Höhenfehler des Telefons bei 11,5 Metern Standardabweichung mit Ausschlägen von −39 bis +32 Metern – Zappeln in dieser Größe lässt eine 10-Meter-Schwelle ungehindert durch. Die Schwelle liegt jetzt bei 30 Metern.
- **Eine Schwelle allein reichte aber nicht.** Der Höhenfehler ist kein zufälliges Zappeln, sondern eine träge Drift: Von einem Punkt zum nächsten lag seine Autokorrelation bei 0,74, der Wert ist also über eine halbe Minute hinweg in dieselbe Richtung verzogen. Für eine Schwelle sieht eine langsame Verschiebung um 25 Meter genauso aus wie ein echter Anstieg. Deshalb werden die Höhen jetzt vor der Summierung über zwei Minuten geglättet. Dasselbe Verfahren meldet für die Wanderung nun **+32/−40 m** statt +496/−496 m – die Referenz weist +30/−40 m aus.
- **Der Genauigkeitsfilter ist beim Aufzeichnen strenger geworden** (30 statt 50 Meter). Von 385 Punkten war genau einer schlecht – gemeldet mit 47,4 Metern und damit knapp unter der alten Grenze. Dieser eine Punkt lag so weit abseits, dass Hin- und Rückweg zu ihm 255 Meter ergaben: 83% des gesamten Streckenfehlers der Tour. Beim Teilen eines einzelnen Standorts bleibt es bei 50 Metern, denn dort gibt es keine Alternative – was da ist, wird geteilt, der Anrufer wartet jetzt. Ein Spurpunkt dagegen hat hunderte Geschwister, und der nächste kommt in zehn Sekunden. Bleibt der Empfang längere Zeit schlecht, greift weiterhin die Fünf-Minuten-Regel: Die Spur wird dünner, sie reißt nicht ab.

Was in dieser Messung **nicht** auffiel, ist ebenso festgehalten: Die vier während der Tour geteilten Standorte lagen 3,6 / 6,6 / 7,9 und 30,8 Meter neben der Referenz – dreimal davon näher an der Wahrheit als die Garmin-Uhr selbst. Das ist die Angabe, auf die es im Ernstfall ankommt. Der Akkuverbrauch lag bei 7,1% pro Stunde (65% auf 51% in 1 Stunde 58 Minuten, davon 94% der Zeit bei ausgeschaltetem Display). Der Zehn-Sekunden-Takt aus 1.0.2 kostet gegenüber dem früheren Dreißig-Sekunden-Takt damit rund einen Prozentpunkt pro Stunde – der Satellitenempfänger läuft ohnehin durchgehend, häufigeres Abfragen ändert daran wenig.

### 1.0.2
Ausgelöst durch die zweite Vergleichsmessung: eine Radtour mit parallel laufender Garmin-Uhr und einem zweiten, ebenfalls aufzeichnenden Rad (29.09.2026). Der Genauigkeitsfilter aus 1.0.1 hat gehalten – die Abweichung fiel von 129% auf 2,3%. Die genaue Auswertung zeigte dann aber, dass diese 2,3% täuschen: Sie sind die Summe zweier Fehler, die sich gegenseitig fast aufheben.
- **Standorte werden alle 10 statt alle 30 Sekunden erfasst.** Dünnt man den Referenztrack auf den bisherigen Abstand aus, verliert er 7,2% seiner Länge: Bei Radgeschwindigkeit liegen zwischen zwei Messungen über 150 Meter, und jede Kurve dazwischen wird zur Geraden. Auf 10 Sekunden sind es nur noch 2,8%. Das Rauschen von 5,3% hat diesen Verlust bisher überdeckt, sodass die Gesamtstrecke fast richtig aussah.
- **Plausibilitätsprüfung für Standorte.** Der Genauigkeitsfilter greift nur, wenn das Gerät seine Unsicherheit selbst zugibt – und das tut es nicht immer. Auf dieser Tour kamen Sprünge von 470 bis 834 Metern durch, gemeldet mit unauffälliger Genauigkeit; der größte entspräche 163 km/h auf dem Fahrrad. Solche Fehlortungen sind nur an der Bewegung zu erkennen, nicht an der gemeldeten Qualität. Ist ein Standort vom letzten guten aus nur mit über 90 km/h erreichbar, wird er verworfen. Wichtiger als die Kilometerzahl ist dabei der Ernstfall: Diese Sprünge gingen bisher auch an den Live-Standort-Link, ein Verfolger sah die Position mehrere hundert Meter neben der Route.
- **Höhendaten werden aufgezeichnet.** Bisher speicherte die App keine Höhe, obwohl Android sie mitliefert – im Export der Radtour hatte kein einziger von 215 Punkten eine Höhenangabe, während die Referenz +400/−380 m auswies. Für eine Bergsport-App war das eine Lücke. Weil die per GPS gemessene Höhe stärker schwankt als die Position, werden nur Änderungen über 10 Meter als echter Anstieg gezählt; ohne diese Schwelle käme selbst auf einer Fahrt durch die Ebene ein dreistelliger Wert zusammen.
- **Streckenlänge und Höhenmeter in „Meine Aktivitäten".** Dort standen bisher nur die Dauer und die Anzahl der GPS-Punkte – eine technische Zahl, die über die Tour nichts sagt.
- **Der Live-Standort-Link wird sparsamer übertragen.** Aufgezeichnet wird alle zehn Sekunden, übertragen weiterhin höchstens alle dreißig. Jeden Punkt zu senden hätte die Zahl der Netzabfragen verdreifacht, und die Funkverbindung kostet mehr Strom als der GPS-Empfänger, der ohnehin durchgehend läuft. Gemessen lagen rund 6% Akku pro Stunde an – auf einer Tagestour ist das der Unterschied zwischen ankommen und nicht ankommen. Für die Verfolgung ändert sich nichts, der Link war auch vorher auf die halbe Minute genau; der erste Punkt nach dem Teilen geht weiterhin sofort hinaus.
- **Android sichert die App-Daten nicht mehr in die Cloud.** Beim Testen der Punkte oben fiel auf, dass eine frisch installierte App sofort wieder eine laufende Aktivität und die alten Notfallkontakte zeigte: Android sichert App-Daten standardmäßig im Google-Konto und spielt sie bei einer Neuinstallation zurück. Für eine App, deren Datenschutzerklärung „ausschließlich lokal auf deinem Gerät" zusagt, ist das ein Widerspruch – Standortspuren und Telefonnummern lagen damit in einem Cloud-Backup. Jetzt ist `allowBackup` abgeschaltet. Die Kehrseite ist bewusst in Kauf genommen: Nach einem Gerätewechsel müssen die Notfallkontakte neu eingetragen werden.
- **Anpassungen für neuere Android-Versionen.** Die App hält jetzt den unteren Bildschirmrand frei: Seit Android 15 zeichnen Apps grundsätzlich bis unter die Systemleisten, wodurch ausgerechnet der SOS-Knopf hinter der Navigationsleiste verschwinden konnte. Außerdem ist die feste Ausrichtung im Hochformat aufgehoben – Android 16 ignoriert solche Einschränkungen auf großen Displays ohnehin.
- **Die einmalig geteilte Standort-Nachricht nennt jetzt die Genauigkeit** – und wartet vorher kurz auf einen brauchbaren Satellitenfix, statt den ersten Standort zu nehmen, den Android liefert (das ist oft der zuletzt bekannte oder eine Funkzellen-Schätzung). Bisher enthielt die Nachricht nur Koordinaten und einen Maps-Link: Wer sie bekam, konnte einen Standort, der auf 5 m stimmt, nicht von einem unterscheiden, der 300 m daneben liegt, und sah in beiden Fällen nur eine Stecknadel. Jetzt steht entweder „auf etwa 12 m genau" dabei oder eine deutliche Warnung mit dem möglichen Umkreis. Das Warten ist auf zwölf Sekunden begrenzt und endet sofort, sobald der Fix gut ist – im Ernstfall darf die Nachricht nicht an einer Wartezeit hängen.
- **Die Genauigkeit steht jetzt im GPX-Export.** Bei der Auswertung der Radtour ließ sich nicht mehr klären, welche Genauigkeit die verbliebenen Ausreißer gemeldet hatten: Der Wert lag in der Datenbank, fehlte aber in der exportierten Datei.

  Hintergrund zur Aufzeichnung im Stand: Die Auswertung hat gezeigt, dass praktisch das gesamte Rauschen dieser Tour in einer einzigen Viertelstunde entstand – der Standzeit. Stillstand an sich ist dabei nicht das Problem; der Referenztrack streut in seinen Standphasen um weniger als drei Meter. Das Problem ist, dass ein Gerät den Verlust des Satellitenfixes nicht immer zugibt: Über vier Minuten hinweg lag die aufgezeichnete Position 50 bis 245 Meter daneben, bei unauffällig gemeldeter Genauigkeit. Für eine Sicherheits-App ist das der wichtigste Fall überhaupt, denn wer verletzt liegt, bewegt sich nicht. Mittelung über mehrere Messungen hilft dagegen nachweislich nicht – gegen einen systematischen Versatz sind alle Messungen gleich falsch. Der einzige belastbare Weg ist, die Unsicherheit offen zu benennen, statt eine Genauigkeit vorzutäuschen.

### 1.0.1
Ausgelöst durch einen Vergleich einer echten Tour mit einer parallel laufenden Garmin-Uhr (27.09.2026):
- **Genauigkeitsfilter für Standortdaten.** Im Hintergrund drosselt Android das GPS und liefert regelmäßig Schätzwerte aus Mobilfunk- oder WLAN-Ortung. Ungefiltert erzeugten die Sprünge von mehreren hundert Metern: Bei der Vergleichsmessung kamen 21,95 km statt der tatsächlich gelaufenen 9,59 km zustande, rund ein Drittel davon aus 19 einzelnen Ausreißern. Gravierender als die falsche Distanz war die Folge für den Ernstfall – ein geteilter Standort konnte mehrere hundert Meter daneben liegen. Punkte, die schlechter als 50 m gemeldet werden, werden jetzt verworfen. Bleibt der Empfang länger als fünf Minuten schlecht, wird trotzdem ein grober Punkt aufgezeichnet: Ein ungenauer Standort ist im Notfall besser als eine Lücke.
- **Es kann nur noch genau eine Aktivität aktiv sein.** Bisher legte die App den Datenbankeintrag an, *bevor* sie nach der Standortberechtigung fragte. Da Android dafür eine eigene Systemseite öffnet und die App dabei pausiert, landete der Nutzer wieder auf dem Startbildschirm und tippte erneut – und hatte zwei aktive Aktivitäten. Die ältere wurde unsichtbar, alle weiteren GPS-Punkte wanderten in die neuere, und die erste Tour brach scheinbar mitten im Lauf ab. Ein Unique-Index in der Datenbank macht das jetzt technisch unmöglich.
- **Zweistufiger Startbildschirm.** Fehlt die Berechtigung, erklärt Schritt 1 den Zweck und bietet nur „Standortzugriff erlauben" an – ohne dass schon eine Aktivität entsteht. Nach der Rückkehr aus den Systemeinstellungen wechselt der Bildschirm von selbst auf Schritt 2 und sagt ausdrücklich, dass jetzt noch einmal getippt werden muss.
- **Der Live-Standort-Link nennt die Genauigkeit.** Wer den Link verfolgt, sah bisher nur eine Stecknadel und musste sie für exakt halten. Jetzt steht dabei, ob der Standort genau ist oder nur ein Umkreis – wer sucht, weiß damit, ob er einen Punkt oder ein Gebiet vor sich hat. Das Alter der Meldung steht in Minuten statt in Sekunden und wird ab zehn Minuten deutlich hervorgehoben.
- Fehlerbehebung: Der Zustand wird jetzt neu aus der Datenbank gelesen, wenn die App aus dem Hintergrund zurückkehrt. Vorher konnte der Startbildschirm „Aktivität starten" anzeigen, obwohl längst eine lief.
- Fehlerbehebung: Scheitert das Stoppen der Standortaufzeichnung, wird die Aktivität trotzdem sauber beendet. Vorher blieb sie in so einem Fall dauerhaft aktiv.

### 1.0.0
Erste öffentliche Version, angeregt durch das Gespräch mit dem Österreichischen Alpenverein (Abteilung Bergsport):
- Akku-Warnung während einer aktiven Tour, sobald der Akkustand unter 15% fällt (mit Ton).
- Hinweis mit Ton, sobald nach einem Verbindungsverlust wieder Netzempfang verfügbar ist.
- Erinnerung nach einem Geräte-Neustart, falls dabei noch eine Aktivität lief – die App muss danach manuell wieder geöffnet werden, um das Tracking fortzusetzen (bewusst kein automatischer Neustart im Hintergrund, um zusätzliche, sensible Berechtigungen zu vermeiden).
- Fehlerbehebung: Fand die App beim Start eine bereits laufende Aktivität vor (z.B. nach einem Geräte-Neustart), wurde das Standort-Tracking bisher nicht automatisch fortgesetzt.

### 0.1.0
Erste Version:
- Standort-Tracking im Hintergrund während einer aktiven Aktivität, automatische Löschung aller Standortdaten bei normalem Tourende.
- SOS-Screen: 112 immer verfügbar, automatische offline Ländererkennung mit länderspezifischer Bergrettungsnummer (AT, CH, SK, PL, CZ, IT, ES, BG), manuelle Länderauswahl für Grenzregionen (Österreich/Schweiz).
- Halten-Geste (5 Sekunden) für Notrufe, schützt vor Fehlbedienung.
- Aufklappbare W-Fragen-Checkliste für den Notruf.
- Dauerhafte Notfallkontakte (max. 2, mindestens einer Pflicht) plus ein optionaler Kontakt nur für die aktuelle Tour, Auswahl auch direkt aus dem Adressbuch.
- Standort teilen als einmaliger Link oder als laufend aktualisierter Live-Standort-Link über einen selbst gehosteten Cloudflare-Worker-Relay.
- "Meine Aktivitäten": Übersicht aller Touren mit erhaltenen Daten (nach einem Vorfall), GPX-Export per Mail oder Teilen-Funktion, einzelnes oder komplettes Löschen.
- "Infos zur App" mit Kontaktangaben und Link zur Projektseite.
- Funktion "App in Werkszustand zurücksetzen" für einen sauberen Neustart.
- Deutsch und Englisch, automatisch nach Gerätesprache.

## Wichtiger Hinweis

NaturlustTrailGuide ist ein privates Projekt und ersetzt keine offiziellen Notfall- oder Rettungsdienste. Die 112 bleibt in jedem Zweifelsfall die zuverlässigste Wahl. Die Nutzung der App erfolgt auf eigene Gefahr; aus der Nutzung können gegenüber dem Urheber keine rechtlichen Ansprüche geltend gemacht werden.

Diese App wurde zusammen mit Claude.ai entwickelt.

## Datenschutz

Siehe [PRIVACY.md](PRIVACY.md) für die Datenschutzerklärung.

## Lizenz

[MIT](LICENSE) – Stephan Rösner ([Naturlust.net](https://naturlust.net))
