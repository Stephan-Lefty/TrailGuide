# TODO

Offene Aufgaben und Ideen für NaturlustTrailGuide. Wird laufend ergänzt.

## Play-Store-Veröffentlichung

- [x] Echten Release-Keystore erzeugen und Signierung umstellen (statt Debug-Keystore)
- [x] Datenschutzerklärung schreiben ([PRIVACY.md](PRIVACY.md)/[PRIVACY.en.md](PRIVACY.en.md))
- [x] Datenschutzerklärung unter fester URL veröffentlicht: https://naturlust.net/trailguide-app-datenschutz/
- [x] Google Play Console: App angelegt
- [ ] Google Play Console: Geschlossenen Test starten – Pflicht für neue Entwicklerkonten, bevor Produktionszugriff möglich ist. Braucht mind. 12 Tester und muss mind. 14 Tage laufen, bevor "Produktionszugriff beantragen" freigeschaltet wird.
  - [x] Länder/Regionen für den Test festgelegt
  - [x] Facebook-Aufruf für Tester gestartet, Interessenten bewerben sich per Mail an info@naturlust.net (Stand: 1 Tester bisher)
  - [x] Reddit als Kanal versucht (r/wandern, r/AlphaandBetaUsers) - Beiträge wurden wegen zu neuem Account wiederholt entfernt, erstmal aufgegeben
  - [x] Eigene Anmeldeseite auf naturlust.net: https://naturlust.net/trailguide-tester-gesucht/ (seit 25.09.2026 online). Formular mit zwei Feldern (Name, Mailadresse des Google-Kontos), die Anmeldungen laufen als Mail an info@naturlust.net auf. Keine Bestätigungsmail an den Tester - Contact Form 7 stuft einen Autoresponder an eine selbst eingetippte Adresse ohne reCAPTCHA/Turnstile als unsicher ein; stattdessen Bestätigung auf dem Bildschirm. Aufruf-Banner dazu auf der Startseite.
  - [x] Release 2 (1.0.0) erstellt und AAB hochgeladen (25.09.2026). Hinweis: Versionscode 1 war durch einen ersten, verworfenen Upload bereits belegt - deshalb steht in `app.json` jetzt `versionCode: 2`. Jeder weitere Upload braucht wieder einen höheren Wert.
  - [x] Eigene Tester-Liste "TrailGuide" angelegt und dem Track zugeordnet. **Wichtig:** E-Mail-Listen gelten in der Play Console kontoweit, nicht pro App - die vorhandene Liste "Tester" (13 Nutzer) gehört zu DialOS Mobil und darf hier nicht angehakt werden.
  - [x] 14 Änderungen zur Überprüfung eingereicht (25.09.2026): Release 2 (1.0.0), Länder DE/CH/AT, Tester-Liste, Store-Eintrag, alle App-Inhalte-Erklärungen. "Verwaltete Veröffentlichung" steht auf **aus**, der Release geht nach der Freigabe also automatisch live.
  - [x] **Freigabe erteilt (27.09.2026)**: Release 2 (1.0.0) steht auf "Verfügbar für Tester auf Google Play", vollständiger Roll-out. Die Erstprüfung dauerte damit zwei Tage statt der elf von DialOS Mobil. Der Opt-in-Link ist ab jetzt aktiv.
  - [x] **Release 3 (1.0.1) eingereicht (27.09.2026, 21:25 Uhr)**, nachdem der Garmin-Vergleich zwei Fehler aufgedeckt hatte. Zeitpunkt bewusst gewählt: Die Installationsbasis stand auf 0,00 %, es hatte also noch **kein einziger Tester** die fehlerhafte Version. Vorabprüfungen liefen ohne Beanstandung durch. "Verwaltete Veröffentlichung" weiterhin aus.
    - Hochgeladen wurde gemeinsam über die Chrome-Erweiterung. Achtung für das nächste Mal: Der Datei-Upload per Browser-Werkzeug ist auf **10 MB** begrenzt, das AAB hat 67 MB - die Datei muss Stephan selbst über den Dateidialog auswählen. Alles andere (Release anlegen, Versionshinweise, Prüfen, Einreichen) lässt sich fernsteuern. Ein Service-Account für die Play Developer API hätte diese Grenze nicht, wurde aber bewusst nicht eingerichtet: Der JSON-Schlüssel wäre dauerhafter Vollzugriff auf das Entwicklerkonto.
    - Versionshinweise sind auf **500 Zeichen** begrenzt (inklusive der `<de-DE>`-Tags). Der erste Entwurf war zu lang und blockierte den "Weiter"-Knopf.
  - [x] Identitätsbestätigung für Android-Entwickler geprüft: Beide Paketnamen (`net.naturlust.trailguide`, `org.dialos.mobil`) sind seit August registriert. Die Frist zum 30.09.2026 ist damit erfüllt - wer sie verpasst, dessen Apps werden **weltweit aus Google Play entfernt**, nicht nur außerhalb des Stores.
  - [x] **Release 3 (1.0.1) ist live (27.09.2026, 21:50 Uhr)** - 25 Minuten nach der Einreichung. Wichtige Erkenntnis für die Testphase: Die *Erstprüfung* dauerte zwei Tage, ein *Update* im bereits freigegebenen Track geht in Minuten durch. Korrekturen müssen also nicht zu Sammelreleases gebündelt werden.
  - [x] Opt-in-Link für die Einladungen: `https://play.google.com/apps/testing/net.naturlust.trailguide` (der Store-Link `https://play.google.com/store/apps/details?id=net.naturlust.trailguide` funktioniert erst, wenn die Einladung angenommen wurde).
  - [x] Beide Webseiten nachgezogen (28.09.2026): Auf [der Tester-Seite](https://naturlust.net/trailguide-tester-gesucht/) stand noch "ich melde mich, sobald alle zusammen sind, das kann Wochen dauern" - jetzt steht dort, dass der Test freigegeben ist und niemand mehr warten muss, dazu die beiden Stolperfallen (Link am Handy öffnen, Einladung annehmen). Auf [der App-Seite](https://naturlust.net/trailguide-app/) ist der Abschnitt "Aktueller Stand" auf 1.0.1 umgeschrieben, inklusive der Geschichte des Garmin-Vergleichs (21,95 statt 9,59 km) - das erklärt den Genauigkeitsfilter besser als jede Funktionsliste.
  - [x] **Opt-in-Weg einmal selbst durchlaufen (28.09.2026)** - Stephan steht seit heute als angemeldeter Tester im Dashboard ("Momentan ist 1 Tester angemeldet" statt 0). Der Weg funktioniert: Opt-in-Link im Browser öffnen, "Werde Tester" klicken, danach ist die App im Store als "NaturlustTrailGuide (Early Access)" sichtbar. Anders als bei DialOS Mobil hat die Play-Console-App den Link **nicht** abgefangen. Eine per Kabel aufgespielte Fassung muss vorher weichen (Google signiert die Store-Version mit einem eigenen Schlüssel); danach startet die Installation von selbst. Die Notfallkontakte sind dabei weg und müssen neu eingetragen werden.
  - [ ] Parallel weiter Tester sammeln, bis mind. 12 Mailadressen zusammen sind (Stand 28.09.2026: 1 angemeldet)
  - [ ] Opt-in-Link an die Tester verschicken. **Eingetragen ist nicht angemeldet** - jeder muss den Link zusätzlich öffnen und die Einladung annehmen, sonst zählt das Dashboard weiter 0. Der Link muss **am Handy** geöffnet werden; auf Stephans Gerät fängt die Play-Console-App `play.google.com`-Adressen ab, dann von Hand in den Browser kopieren. Beides gehört in die Einladungsmail.
  - [ ] Mehr als 12 Adressen einsammeln, falls möglich - bei DialOS Mobil waren es exakt zwölf ohne Puffer, und seit Wochen fehlen dort zwei, die nie angenommen haben.
  - [ ] 14-Tage-Frist abwarten (läuft erst, wenn zwölf **gleichzeitig** angemeldet sind), dann Produktionszugriff beantragen

## Zweite Vergleichsmessung: Radtour vom 29.09.2026

Erste Tour mit dem Genauigkeitsfilter aus 1.0.1, gefahren 18:07-19:51 Uhr, parallel auf Garmin/Komoot. Der Filter hat gehalten - dafür ist ein zweites, davon unabhängiges Problem sichtbar geworden.

| | TrailGuide | Komoot (Referenz) |
|---|---|---|
| Strecke | 21,82 km | 22,33 km |
| Dauer | 103,7 min | 102,2 min |
| Punkte | 215 | 5029 |
| Punktabstand | 29,1 s | 1,2 s |

- [x] **Der Genauigkeitsfilter wirkt.** Vom 27.09. auf den 29.09.: von +129 % Abweichung (21,95 gegen 9,59 km) auf -2,3 %. Die Ausreißer von mehreren hundert Metern sind weg.
- [x] **Die -2,3 % täuschen aber.** Sie sind die Summe aus zwei Fehlern, die sich gegenseitig fast aufheben. Nachgewiesen, indem der Komoot-Track auf unseren Punktabstand ausgedünnt wurde - das ist die Strecke, die bei perfekter Messung herauskommen müsste:
  - Kurven abschneiden: **-1,61 km** (-7,2 %). Bei 29 s Abstand liegen zwischen zwei Punkten über 150 m, jede Kurve dazwischen wird zur Geraden.
  - Restliches GPS-Rauschen: **+1,10 km** (+5,3 %), gemessen gegen den ausgedünnten Sollwert von 20,72 km.
  - Ohne die Gegenprobe hätte die Messung als "praktisch deckungsgleich" gegolten. Merksatz für künftige Vergleiche: **Erst bei gleichem Punktabstand vergleichen.**
- [x] **Punktabstand von 30 s auf 10 s verkürzt** (`timeInterval` in `backgroundLocationService.ts`, `distanceInterval` von 25 auf 10 m). Aus der Ausdünnungsreihe: 10 s verliert nur noch 2,8 % statt 7,2 %, 5 s wären 1,3 %. 10 s ist der Kompromiss zugunsten des Akkus.
- [ ] **Akkuverbrauch bei 10 s messen.** Das ist die Gegenrechnung zur Verkürzung und noch offen. Bei einer Sicherheits-App auf einer Achtstundentour zählt jedes Prozent - wenn der Verbrauch deutlich steigt, muss der Abstand wieder hoch oder abhängig von der Geschwindigkeit werden.
- [x] **Nachträgliche Geschwindigkeitsgrenzen sind der falsche Weg** - geprüft und verworfen. Ein Segment zu verwerfen heißt, die Strecke zwischen zwei realen Orten als null zu zählen; bei nur 215 Punkten ist jedes Segment über 100 m wert. Eine Grenze von 60 km/h drückt die Tour auf 17,46 km, 40 km/h auf 14,13 km - beides weit unter dem Sollwert. Dichter messen hilft, nachträglich aussortieren schadet.

### Die vier geteilten Standorte

Stephan hat viermal den Standort verschickt und die Uhrzeiten notiert. Damit ließ sich erstmals prüfen, wie genau die App im Ernstfall wäre - gemessen als Abstand zum nächstgelegenen Punkt des Referenztracks, also zeitunabhängig:

| Uhrzeit | Abstand zur gefahrenen Strecke |
|---|---|
| 18:36 | 4 m |
| 18:49 | 30 m |
| 18:57 | 2 m |
| 19:17 | 3 m |

- [x] Drei von vier Positionen lagen im einstelligen Meterbereich, die vierte bei 30 m. **Alle vier unter der 50-m-Schwelle des Filters.** Für einen Rettungseinsatz ist das brauchbar: 30 m sind im Gelände noch Sichtweite.
- [ ] Trotzdem offen: In der verschickten Nachricht steht **keine Angabe zur Genauigkeit**, nur Koordinaten und Maps-Link. Bei 30 m ist das unerheblich, bei 300 m nicht - und der Empfänger kann es nicht unterscheiden. Der Live-Viewer zeigt die Genauigkeit inzwischen, die einmalige Nachricht nicht.

### Weitere Befunde aus der Auswertung

- [x] **Genauigkeit wandert jetzt in den GPX-Export** (`<extensions>` mit eigenem Namensraum). Bei dieser Auswertung ließ sich nicht klären, welche Genauigkeit die verbliebenen Ausreißer gemeldet hatten - die Angabe steht in der Datenbank, fehlte aber in der Datei.
- [x] **Streckenlänge in der Aktivitätsliste.** Bisher standen dort nur Dauer und "215 GPS-Punkte" - eine technische Zahl, die einem Wanderer nichts sagt. Die Punkte lagen ohnehin im Speicher, es hat nur niemand die Strecke daraus gerechnet. Neu: `trackStats.ts` mit Tests, Anzeige als "21,8 km · 104 min 38 s · 215 GPS-Punkte".
- [ ] **Höhendaten fehlen komplett.** Der Export hat 0 von 215 Punkten mit Höhenangabe, Komoot hat für dieselbe Tour +400/-380 m. Für eine Bergsport-App ist das eine Lücke: `TrackPoint` kennt kein `altitude`, obwohl Android die Angabe mitliefert. Braucht eine Datenbank-Migration.
- [x] Drei Aufzeichnungslücken über zwei Minuten, die längste 3,9 min - deutlich besser als die 10,4 min vom 27.09., aber noch da. Die App steht weiter nicht auf der Akku-Ausnahmeliste.
- [ ] **Bosch-Kilometerstand steht noch aus** - der einzige Wert, der nicht aus GPS stammt, sondern mechanisch am Laufrad gemessen wird. Damit ließe sich klären, ob Komoots 22,33 km selbst schon etwas Rauschen enthalten.
- [x] Beim Beenden wurde korrekt "Vorfall" gewählt, genau eine Aktivität war aktiv, Start- und Endzeit deckten sich mit Komoot. Die Korrekturen aus 1.0.1 haben im Feld gehalten.
- [ ] Institutionelle Kontakte für Unterstützung/Reichweite angeschrieben (Details: [[project_trailguide_oeav_kontakt]] in Claudes Memory)
  - Manuel Reindl (ÖAV, Abteilung Bergsport): sehr interessiert, Gesprächstermin 24.09.2026, 20:30 Uhr (Videocall)
  - Bernd Noggler (Geschäftsführer Leitstelle Tirol): wies auf offizielle, seit 2018 etablierte App "SOS-EU-ALP" hin (direkt an Leitstelle angebunden); Stephan hat Datenschutz als Hauptunterschied herausgestellt (TrailGuide speichert standardmäßig nichts ohne Vorfall) und um Einschätzung/Unterstützung gebeten, Antwort steht noch aus
  - Bergwacht Bayern: höfliche Absage (kein Test-/Entwicklungspartner, Ressourcen auf Kernaufgabe Bergrettung fokussiert), inhaltlich aber wohlwollend ("Ansatz definitiv sinnvoll")
  - DAV und Bergrettung Tirol per Mail angeschrieben, bisher keine Rückmeldung
  - [x] Präsentation für das ÖAV-Gespräch erstellt und nach dem Gespräch aktualisiert (13 Seiten): Screenshots mit Erklärungen inkl. geöffneter Untermenüs, Detailfolie zu den 6 W-Fragen, Folie "Neu seit gestern Abend", Vergleich zu SOS-EU-ALP. Liegt unter `~/Schreibtisch/TrailGuide-Screenshots-OeAV/` - einmal normal und einmal als `..._druckbar.pdf` (Seiten fest gedreht, sonst druckt der Brother-Treiber leere Blätter).
  - [x] Kontaktnamen in allen Screenshots durch Phantasienamen ersetzt
  - [x] Mail mit allen Infos an Manuel Reindl verschickt (25.09.2026)
- [x] Google Play Console: Alle App-Inhalte-Deklarationen abgeschlossen (Datenschutzerklärung, Anmeldedaten, Anzeigen, Altersfreigaben/IARC, Zielgruppe, Datensicherheit, Behörden-Apps, Finanzfunktionen, Werbe-ID, Gesundheits-Apps)
- [x] Google Play Console: Formular/Nachweis für Hintergrund-Standortzugriff ("Prominent Disclosure") eingereicht, inkl. Demo-Video (25.09.2026)
  - Dafür wurde in der App ein Hinweistext ergänzt, der VOR der Berechtigungsabfrage erklärt, wofür der Hintergrund-Standort gebraucht wird (Bildschirm "Aktivität starten") - Google verlangt das ausdrücklich, und der Hinweis muss auch im Video zu sehen sein.
  - Demo-Video (22 Sek., zeigt Hinweistext → Berechtigungsabfrage → "Immer zulassen" → laufendes Tracking): https://youtube.com/shorts/MwTUaYQ903s, Rohdatei liegt unter `~/Schreibtisch/TrailGuide-Screenshots-OeAV/standort-berechtigung-demo.mp4`
  - Derselbe Videolink wird in ZWEI Formularen gebraucht: "Berechtigungen zur Standortermittlung" und "Berechtigungen für Dienste im Vordergrund" (dort zusätzlich Häkchen bei "Vom Nutzer initiierte Standortfreigabe").
- [x] Store-Listing-Texte geschrieben ([docs/play-store-listing.md](docs/play-store-listing.md)): Kurz- und Langbeschreibung, fertig zum Reinkopieren
- [x] Store-Listing-Texte in Play Console eingetragen, Content-Rating-Fragebogen ausgefüllt, App-Symbol (512x512) und Vorstellungsgrafik (1024x500) erstellt und hochgeladen, Screenshots hochgeladen
- [x] Store-Screenshots fürs Play-Store-Format angepasst (Original-Screenshots hatten 2.23:1, Play Store erlaubt max. 2:1) - fertige Versionen liegen unter [screenshots/playstore/](screenshots/playstore/)
- [x] Version auf 1.0.0 angehoben (app.json + package.json), Release-AAB für den Play-Store-Upload gebaut und mit dem echten Release-Keystore signiert (`android/app/build/outputs/bundle/release/app-release.aab`)
- [x] Versionsnummer wird jetzt unter "Infos zur App" angezeigt - in der Testphase wichtig, damit Tester Rückmeldungen einer Version zuordnen können

## Von Manuel Reindl (ÖAV) angeregte Verbesserungen (24.09.2026)

- [x] Akku-Warnung während aktiver Tour, sobald der Akku unter 15% fällt (mit Ton)
- [x] Hinweis mit Ton, sobald nach Verbindungsverlust wieder Netz verfügbar ist
- [x] Erinnerung nach einem Geräte-Neustart, falls dabei noch eine Aktivität lief ("App wieder öffnen, um Tracking fortzusetzen") - bewusst kein automatischer Neustart des Trackings selbst (dafür wäre eine sensiblere Berechtigung nötig, die nicht zur Datensparsamkeits-Positionierung passt)
- [x] Nebenbei entdeckten Bug behoben: Fand die App beim Start eine bereits laufende Aktivität vor (z.B. nach einem Geräte-Neustart), wurde das Standort-Tracking bisher NICHT automatisch fortgesetzt - nur die Akku-/Netz-Überwachung. Das lief unbemerkt seit der Testversion vom Vortag mit Manuel.
- [ ] Bewusst nicht umgesetzt: Notruf automatisch absetzen, sobald wieder Netz da ist - ein Telefonanruf lässt sich nicht "vormerken"; die App erinnert stattdessen nur daran, dass man jetzt wieder Netz hat
- [x] Website https://naturlust.net/trailguide-app/ auf den Stand 1.0.0 gebracht: Abschnitt "Aktueller Stand" neu geschrieben (vorher noch "80 Minuten getestet"), neuer Absatz "Immer informiert unterwegs" bei den Notfall-Funktionen

## Vergleichsmessung gegen eine Garmin-Uhr (27.09.2026)

Am 27.09. lief TrailGuide auf einer echten Tour (Leutasch - Grünkopf - Lautersee - Mittenwald) parallel zu einer Garmin fēnix 6 mit Komoot. Der Vergleich hat Dinge aufgedeckt, die ohne Referenztrack nie aufgefallen wären - und das vor dem ersten Tester.

- [x] **Zeitlich stimmte alles**: Komoot 5 h 17 min, TrailGuide 11:02:58 bis 16:21:41 = 5 h 19 min. Achtung: Komoot zeigt auf der öffentlichen Seite **UTC**, nicht Ortszeit - die auf den ersten Blick fehlenden zwei Stunden waren ein Zeitzonen-Irrtum, kein Datenverlust.
- [x] **Die Strecke stimmte überhaupt nicht**: 21,95 km statt 9,59 km. 19 Segmente mit über 25 km/h erzeugten allein 7,62 km - Sprünge von bis zu 673 m in 54 Sekunden, jeweils paarweise hin und zurück. Ursache: Android drosselt im Hintergrund das GPS und liefert Schätzwerte aus Mobilfunk-/WLAN-Ortung. Die App speicherte die mitgelieferte Genauigkeit zwar, nutzte sie aber nirgends. **Behoben** durch den Filter in [src/services/location/locationQuality.ts](src/services/location/locationQuality.ts) (Schwelle 50 m; nach 5 Minuten Funkstille wird trotzdem ein grober Punkt aufgezeichnet, weil ein ungenauer Standort im Notfall besser ist als eine Lücke).
- [x] **Die Tour war in zwei Datensätze zerfallen**: Es lagen drei Aktivitäten gleichzeitig auf "aktiv" (11:02, 11:03, 12:47). Ursache: `createHike()` legte den Eintrag an, BEVOR nach der Standortberechtigung gefragt wurde - Android öffnet dafür eine eigene Systemseite und pausiert die App dabei. **Behoben** durch Unique-Index in der Datenbank, transaktionales Anlegen und den zweistufigen Start-Bildschirm.
- [x] Auf dem Gerät durchgespielt: Berechtigung entzogen, Schritt 1 angezeigt, über die Systemseite "Immer zulassen" erteilt, Rückkehr wechselt selbsttätig auf Schritt 2, Start läuft, genau eine Aktivität. Standortgenauigkeit danach ±13 bzw. ±18 m statt der ±100 m von vorher.
- [ ] **Offen: keine Höhendaten.** Die App speichert zu keinem Punkt eine Höhenangabe, die GPX-Dateien enthalten kein `<ele>`. Ein Vergleich der 600 Höhenmeter war damit unmöglich - und für eine Bergrettung wäre die Höhe eine der nützlichsten Angaben überhaupt.
- [ ] **Offen: der SOS-Pfad ist ungeprüft.** Beim einmaligen Standort-Teilen läuft ein anderer Codepfad (`getCurrentPositionAsync` im Vordergrund, deutlich besserer Empfang). Dort wird aber (a) die Genauigkeit weggeworfen statt in die Nachricht geschrieben und (b) nicht auf einen brauchbaren Fix gewartet - der erstbeste Wert geht raus, auch wenn er noch aus der Mobilfunkortung stammt. Belastbar messen lässt sich das nur draußen im Gelände.
- [ ] **Offen: Aufzeichnungslücken.** 10,4 Minuten ab 13:30, dazu mehrere um 5 Minuten. Vermutlich Doze - die App steht nicht auf der Akku-Ausnahmeliste. Deutlich harmloser als die Ausreißer, aber notiert.
- [ ] **Offen: GPX lässt sich nicht lokal speichern.** Das Teilen-Fenster bietet nur WhatsApp, Mail, Nextcloud, Drive - keine Möglichkeit, die Datei auf dem Handy abzulegen. Beim Auswerten musste der Umweg über eine Mail an sich selbst gegangen werden.

## Live-Standort-Link (Cloudflare-Relay)

- [x] Der Viewer nennt jetzt die Genauigkeit: "Standort genau (±12 m)" grün bzw. "Nur ungefährer Standort (±180 m)" gelb, mit dem ausdrücklichen Hinweis, dass die Person sich irgendwo in diesem Umkreis befinden kann. Ein Retter weiß damit, ob er einen Punkt oder einen Suchradius vor sich hat.
- [x] Das Alter steht in Minuten statt "vor 624s" und wird ab zehn Minuten rot hervorgehoben.
- [x] Am 27.09.2026 auf Cloudflare ausgerollt und per Abruf der ausgelieferten Seite geprüft. Hinweis für das nächste Mal: Der OAuth-Zugang von `wrangler` läuft ab und lässt sich nur in einem **interaktiven** Terminal erneuern (`npx wrangler login` im Ordner `server/`, dann zügig im Browser auf "Authorize" - der Link hat ein kurzes Zeitfenster und bricht sonst mit "Timed out waiting for authorization code" ab). Konto: (Konto steht in der privaten Ablage).

## Qualitätssicherung

- [ ] **Es gibt keine CI.** Das Repo ist privat, Tests laufen nur lokal (`npm test`). TrailGuide steht nicht auf der Ausnahmeliste - hier fehlt ein GitHub-Actions-Workflow. Wegen der Minutenabrechnung bei privaten Repos: **ein** Linux-Job mit Typecheck und Jest gebündelt, `concurrency` mit `cancel-in-progress`, `paths-ignore` für `**.md`.
- [ ] Achtung beim Bauen: Auf Stephans Rechner liegt seit einem Manjaro-Update nur noch JDK 26, damit scheitert das Android-Gradle-Plugin (`jlink`-Fehler beim Erzeugen der Systemmodule). Gebaut wird mit `JAVA_HOME=/usr/lib/jvm/java-21-openjdk` und `ANDROID_HOME=$HOME/Android/Sdk`.
- [ ] Testen auf weiteren Android-Herstellern (Samsung, Xiaomi) - Motorola wurde bereits mehrfach über mehrere Stunden getestet, andere Hersteller drosseln Hintergrund-Apps teils stärker
- [ ] iOS-Build und -Test (bisher nur Android getestet)

## Später / optional

- [ ] Umstieg von Cloudflare-Relay auf eigenen EU-Server (z.B. Hetzner, Docker neben bestehender Nextcloud) für den Live-Standort-Link
- [ ] Ggf. Umstieg von `expo-location`/`expo-task-manager` auf `react-native-background-geolocation` (kostenpflichtig), falls die gelegentlichen Tracking-Lücken (bis zu ~17 Min. bei längerem Stillstand beobachtet) im echten Einsatz zu einem Problem werden
