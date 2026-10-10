# TODO

Offene Aufgaben und Ideen für NaturlustTrailGuide. Wird laufend ergänzt.

## Verteilung außerhalb des Play Stores (Stand 06.10.2026)

Ausgangsfrage von Stephan: „Wo wollen wir die App noch anbieten, damit jeder Android-Nutzer sie nutzen kann?" Geprüft wurden F-Droid, IzzyOnDroid, Accrescent, Uptodown, Aptoide, Huawei AppGallery, Samsung Galaxy Store und der direkte Download.

- [x] **Direkter Download auf naturlust.net – steht seit 05.10.2026.** Der wichtigste Weg, und derzeit sogar der einzige: Der geschlossene Test läuft noch, die Store-Adresse `play.google.com/store/apps/details?id=net.naturlust.trailguide` liefert **404**. Ohne Einladung kommt niemand an die App.
  - [x] APK verkleinert: 104 → 60 MB (1.0.6, siehe Änderungsprotokoll)
  - [x] **Es ist die „Signierte universelle APK" aus der Play Console**, nicht unser eigener Build. Am geladenen Paket nachgeprüft: `CN=Android, O=Google Inc.`, Zertifikat-SHA-256 `79e3db78…ab35`. Nur damit lässt sich zwischen Homepage- und Store-Installation **ohne Deinstallieren** wechseln – genau der Datenverlust, der am 04.10.2026 die Notfallkontakte gekostet hat. Zu finden unter *Test und Veröffentlichung → Letzte Releases und App-Bundles → Alle App-Versionen → Downloads → Assets*. **Sie steht schon bereit, wenn das Bundle nur ein Entwurf ist** – man muss keinen Release abwarten.
  - [x] Die Datei liegt als **GitHub-Release** (`v1.0.6`), nicht in der Mediathek: WordPress nimmt APK-Dateien normalerweise gar nicht an, und 60 MB sprengen das Upload-Limit. Nebeneffekt: Wer Obtainium nutzt, bekommt Updates automatisch.
  - [x] Abschnitt auf [/trailguide-app/](https://naturlust.net/trailguide-app/) mit Dateigröße und SHA-256. Werkzeug: `Werkzeuge/trailguide_download.py` auf dem Homepage-Laufwerk.
  - [x] **Richtigstellung 06.10.2026:** Hier stand, der Abschnitt enthalte eine „Anleitung für die Installation aus unbekannter Quelle". Das war er nicht – es war **ein Satz** („Android fragt beim Installieren einmal nach"). Auf Stephans Frage hin nachgezählt und ersetzt. Die zu großzügige Formulierung hätte die Frage beinahe mit einem falschen „ja, haben wir" beantwortet; Häkchen nur setzen für das, was wirklich da ist.
  - [x] **Echte Anleitung seit 06.10.2026.** Werkzeug: `Werkzeuge/trailguide_anleitung.py`. Fünf Schritte, der erste Start mit „Schritt 1 von 2: Standortzugriff", eine Liste der Fehlermeldungen samt Bedeutung, und der Hinweis, dass der Download vor die Tour gehört – 60 MB über Mobilfunk sind unnötig und ohne Empfang geht es gar nicht.
  - [x] **Alle Gerätetexte nachgesehen, nicht erinnert.** Dialogtexte mit `aapt2 dump resources` aus dem `GooglePackageInstaller` von Stephans Motorola (Android 16). Der Einstellungsbildschirm per `uiautomator`-Abzug – nötig, weil die Settings-Ressourcen „Zugelassen/Nicht zugelassen" sagen, **angezeigt** aber „Zulässig/Nicht zulässig" wird. Mindest-Android (7.0) aus dem `uses-sdk` des ausgelieferten APK, Platzbedarf (70 MB) per `du` auf dem Installationsverzeichnis gemessen.
  - [x] **Dabei einen eigenen Fehler abgefangen:** Ich hatte in die Anleitung geschrieben, die App frage beim ersten Start nach dem Standortzugriff. Tut sie nicht – `start.tsx` zeigt ihn erst beim ersten Tipp auf „Aktivität starten", und danach muss man **noch einmal** tippen (`permissionReadyHint` sagt es selbst). Vor dem Veröffentlichen im Quelltext nachgesehen.
  - [x] **QR-Code in beiden READMEs (10.10.2026)**, nach dem Vorbild von HANDYHelfer. Bis dahin stand in der README **überhaupt kein Download** – kein Wort über die Veröffentlichungen, keine APK, in keiner der beiden Sprachen. Wer auf dem Repo landete, erfuhr nicht, dass es die App zum Herunterladen gibt. Der fehlende Abschnitt war das größere Loch, der Code nur das Dach darauf.
    - **Der HANDYHelfer-Trick trägt hier nicht**, und das ist nachgemessen statt vermutet: Dort heißt die Datei in jedem Release gleich (`HANDYHelfer.apk`), deshalb zeigt `releases/latest/download/HANDYHelfer.apk` dauerhaft auf die neueste. Unsere Datei heißt `NaturlustTrailGuide-1.0.6.apk`, also mit Version. Gemessen: `latest/download/NaturlustTrailGuide-1.0.6.apk` → **200**, aber nur weil 1.0.6 gerade die neueste ist; `latest/download/NaturlustTrailGuide.apk` → **404**. Mit 1.0.7 würde aus dem ersten Link still ein 404 – bei einem QR-Code besonders fies, weil ihn niemand bemerkt, am wenigsten wir.
    - **Deshalb zeigt der deutsche Code auf [/trailguide-app/](https://naturlust.net/trailguide-app/)**, nicht auf die Datei: nie veraltet, unabhängig von Asset-Namen, und der Mensch landet bei den Schritten statt in Androids Rückfragen. Bilder: `assets/installieren-qr.png` (deutsch) und `assets/install-qr.png` (englisch). Erzeugt mit `qrencode -s 12 -m 2 -l M`, Inhalt mit `zbarimg --raw` gegengeprüft.
  - [ ] **Zu entscheiden: konstanter Dateiname ab der nächsten Fassung.** Hieße das Asset immer `NaturlustTrailGuide.apk`, könnte der Code wie bei HANDYHelfer direkt die Datei laden – ein Schritt weniger am Handy. Preis: Die Version steht nicht mehr im Dateinamen, was bei Rückfragen („welche Fassung hast du?") hilft; dafür zeigt die App sie unter *Infos zur App*. Alternative ohne Nachteil: zusätzlich eine zweite Datei mit konstantem Namen hochladen, kostet 57 MB doppelt pro Release.
  - [ ] **Englische Installationsanleitung fehlt.** naturlust.net hat die Seite nur auf Deutsch, deshalb zeigt der Code in `README.en.md` auf die Veröffentlichungen statt auf eine Anleitung – im Text offen benannt. (Ob es eine englische Seite gibt, war am 10.10. nicht prüfbar: ungecachte Seiten gaben wegen der Datenbankarbeiten 500, also ließ sich „gibt es nicht" nicht von „gerade nicht erreichbar" unterscheiden.)
- [ ] **Falsche Annahme, hier festgehalten, damit sie nicht wiederkommt:** Ich hatte behauptet, der Play-Download schrumpfe durch die ABI-Umstellung von „rund 37" auf 26,4 MB. Die Console sagt: **26,4 MB, −383 Byte gegenüber 1.0.5** – also praktisch unverändert. Google schneidet schon immer passgenaue Pakete, die x86-Teile hat nie jemand heruntergeladen. Kleiner wird allein die APK zum direkten Herunterladen. Die 37 MB waren geschätzt, nicht gemessen.
- [ ] **„Verwaltete Veröffentlichung" steht inzwischen auf AN.** Weiter unten in dieser Datei ist noch „aus" vermerkt (Stand 1.0.1, da ging der Release nach der Freigabe automatisch live). Seit dem 05.10.2026 wartet er nach Googles Freigabe auf einen Klick. Entweder wieder ausschalten oder daran denken.
- [ ] **8 von 19.171 Gerätemodellen fallen mit 1.0.6 weg** (2 Telefone, 3 Tablets, 3 Android-Auto-Systeme mit Intel-Prozessor). **Chromebooks sind nicht betroffen** – die 77 unterstützten Modelle bleiben alle. Die Sorge davor war unbegründet.
- [ ] **R8 ist im Release-Build aus** (`android.enableMinifyInReleaseBuilds` steht auf `false`). Der Bundle-Explorer meldet deshalb „DEX-Codeoptimierung: Niedrig", und beim Einreichen kommt eine Warnung wegen der fehlenden Offenlegungsdatei. Einschalten würde die App kleiner und etwas schneller machen, kann bei React Native aber Nebenwirkungen haben, die erst am Gerät auffallen – eigene Baustelle mit eigenem Gerätetest.
- [ ] **Huawei AppGallery prüfen.** Der einzige Laden, der Nutzer erschließt, die wir sonst gar nicht erreichen – diese Geräte haben kein Play. Die App hängt an **keinen** Play Services (nachgeprüft: kein `play-services-*`, kein Firebase, keine Tracker), würde dort also tatsächlich laufen.
- [ ] **Samsung Galaxy Store prüfen.** Größte Reichweite nach Play in Deutschland, und der Galaxy Store macht Googles Entwickler-Verifizierung mit, bleibt also zukunftssicher. Mit der Play-signierten APK bleibt die Signatur überall dieselbe.
- [x] **IzzyOnDroid: fällt rechnerisch durch.** Die Richtlinie nennt **30 MB pro App** als Obergrenze. Selbst nach dem Verkleinern sind es 60 MB. Keine Verhandlungssache, sondern eine Zahl.
- [x] **F-Droid: nicht jetzt.** Drei Gründe, jeder allein schon schwer: Das **Repo ist privat** (müsste öffentlich werden) – **überholt, am 10.10.2026 nachgemessen: Das Repo ist öffentlich** (`visibility=PUBLIC`, und anonym ohne Anmeldung geprüft: Repo, `releases/latest` und die APK-Datei liefern alle 200). Dieser Grund ist also weg; die beiden anderen bleiben und tragen die Entscheidung weiter. F-Droid baut aus dem Quelltext und bekommt Expo/React Native nur mit erheblichem Aufwand reproduzierbar, und F-Droid **signiert selbst** – anderer Fingerabdruck, also wieder Deinstallieren. Dazu kommt, dass F-Droid öffentlich erklärt hat, dass Googles Registrierungspflicht genau ihr Modell trifft: rund 85 % ihres Katalogs hängt an ihrer eigenen Signatur-Infrastruktur.
- [x] **Accrescent: später.** Passt technisch (128 MiB Grenze, Domain-Nachweis über naturlust.net wäre machbar), aber die Anmeldung läuft nur auf Freischaltung und die Reichweite ist noch sehr klein.
- [x] **Aptoide und Uptodown: verworfen.** Bringen keine neuen Nutzer, sondern nur ein zweites, mit der Zeit veraltendes Exemplar der App in Umlauf. Bei einer Sicherheits-App ist das ein Risiko ohne Gegenwert.

**Der Zeitdruck dahinter:** Googles Entwickler-Verifizierung ist seit **30.09.2026** in Brasilien, Indonesien, Singapur und Thailand aktiv und kommt **2027 global auf alle zertifizierten Geräte**. Danach lässt sich eine App nur noch normal installieren, wenn Paketname **und Signatur-Fingerabdruck** unter einer verifizierten Entwickler-Identität registriert sind. Beide Paketnamen sind seit August registriert – aber eben mit dem Play-Signaturschlüssel. Das ist das zweite, stärkere Argument dafür, die Homepage-APK aus der Play Console zu nehmen statt selbst zu signieren.

Die offene Frage dazu ist beantwortet: **Zusätzliche Signaturschlüssel lassen sich registrieren.** Der Hinweiskasten auf der Startseite der Play Console sagt das ausdrücklich („Du solltest auch alle zusätzlichen Schlüssel für deine Google-Play-Apps registrieren, die zum Signieren außerhalb von Google Play verwendet werden"). Weil wir die Play-signierte APK verteilen, brauchen wir es nicht.

**Nachtrag 06.10.2026 – die Mechanik ist schon auf dem Gerät.** Beim Auslesen der Installer-Texte für die Anleitung mitgefunden: Stephans Motorola (Android 16, Patchstand 2026-07-01) trägt die Entwicklerbestätigung bereits in den Ressourcen. `cannot_install_app_blocked_title` = „App-Entwickler nicht überprüft", dazu `install_without_verifying` („Ohne Überprüfung installieren") – es gibt also einen Ausweg – und eine Variante `cannot_install_verification_unavailable_fail_closed_summary`: Lässt sich der Entwickler **nicht** prüfen, wird blockiert, nicht durchgelassen. In Deutschland greift es noch nicht, ausgeliefert ist es aber. **Und die Prüfung braucht Internet** (`cannot_install_verification_no_internet_title`). Für eine App, die man am Berg nachinstallieren können soll, ist das die unangenehmste Stelle: Genau dort ist kein Empfang. Steht als Ausblick auf der Download-Seite.

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
  - [ ] **Die Anmeldung nahm am 08.10.2026 nichts an - die Datenbank der Webseite war ausgefallen.** Fünf von fünf Abfragen der Schnittstelle gaben "Error establishing a database connection" (MySQL auf `127.0.0.1:3306`), ebenso `admin-ajax.php` - und genau darüber nimmt Contact Form 7 die Anmeldungen an. Die Seiten lieferten dabei HTTP 200 mit vollem Inhalt, weil WP Rocket fertiges HTML aus dem Cache ausgibt; von außen war **nichts zu sehen**. Drei Dinge zusammen machen den Ausfall unsichtbar: der Cache zeigt eine gesunde Seite, Contact Form 7 speichert nichts (es verschickt nur Mail, ohne Datenbank bleibt kein Eintrag zurück), und eine Bestätigungsmail an den Tester gibt es bewusst nicht. Der Interessent erfährt also nicht, dass es schiefging - und der einzige Weg, es zu melden, wäre dasselbe Formular.
    - **Aufgeklärt, noch am selben Tag: Das war Stephans eigene Arbeit an der Seite**, die Reparatur lief bereits. Kein Ausfall über Tage, keine verlorenen Anmeldungen. **Damit ist der Stand von einem Tester eine echte Zahl** - die Vermutung, ein kaputtes Formular könnte ihn erklären, ist widerlegt und nicht weiterzuverfolgen.
    - Prüfbefehl: `curl -s -o /dev/null -w "%{http_code}\n" "https://naturlust.net/wp-json/wp/v2/types"` - `200` heißt gesund, `500` heißt weiter ausgefallen. Danach das Formular einmal selbst mit einer eigenen Adresse abschicken und nachsehen, ob die Mail bei `info@naturlust.net` ankommt.
    - Zu überlegen, wenn es wieder läuft: ein Speicher für die Einsendungen (etwa Flamingo), damit eine Anmeldung nicht allein an der Zustellung einer Mail hängt.
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
  - [x] **Release 4 (1.0.2) eingereicht (30.09.2026, 08:40 Uhr)**, wieder gemeinsam über die Chrome-Erweiterung. Der Upload des 70-MB-AAB dauert rund eine Minute, danach optimiert Google das Bundle etwa ebenso lange - in dieser Zeit darf die Seite nicht verlassen werden. Eine Warnung erschien ("keine Offenlegungsdatei verknüpft"), sie ist gegenstandslos: Code-Verschleierung ist im Projekt gar nicht aktiviert (`enableMinifyInReleaseBuilds = false`), es gibt also nichts zu entschlüsseln.
    - Die Freigabe der Ausrichtung zahlt sich sofort aus: Google meldet **+6 Tablets, +17 Auto-Geräte, +3 TV** als neu unterstützt, ohne dass ein einziges wegfällt.
  - [x] **Release 4 (1.0.2) ist live (30.09.2026, 09:02 Uhr)** - 22 Minuten nach der Einreichung, praktisch identisch zu den 25 Minuten bei 1.0.1. Auf dem Gerät nachgeprüft: `versionCode=4`, `installerPackageName=com.android.vending`, und die Flags lauten jetzt `HAS_CODE ALLOW_CLEAR_USER_DATA` - **das `ALLOW_BACKUP` ist weg**, der Datenschutz-Fix wirkt also auch in der Store-Fassung.
    - **Stolperfalle für die Tester:** Der Play Store hatte zunächst noch 1.0.1 im Cache und hat beim Antippen von "Installieren" die alte Version aufgespielt, obwohl die Console 1.0.2 längst als veröffentlicht auswies. Erst nach einem Neustart der Store-App erschien "Aktualisieren". Wer sich meldet, er habe die neue Fassung nicht bekommen: Play Store schließen und neu öffnen.
  - [x] **Release 5 (1.0.3) eingereicht und live (01.10.2026)** - eingereicht gegen 09:20 Uhr, veröffentlicht vor 09:51 Uhr. Damit zum dritten Mal eine knappe halbe Stunde (25 / 22 / ~30 Minuten); die zwei Tage der Erstprüfung bleiben die Ausnahme.
    - **Neue Stolperfalle: Ein hochgeladenes AAB hängt noch an keinem Release.** Nach dem Upload zeigte die Übersicht weiter "4 (1.0.2)" und "keine unveröffentlichten Änderungen", der Entwurf im Alpha-Track war leer - die Datei lag nur in der Bundle-Bibliothek. Behoben über "Aus der Bibliothek hinzufügen", ohne erneuten Upload. Merksatz: Nach dem Hochladen muss der Release **gespeichert** werden, sonst liegt die Datei herrenlos herum.
    - Die Versionshinweise nehmen nur die Sprachen an, die der Store-Eintrag führt. Googles Vorlage enthielt ausschließlich `<de-DE>` - ein `<en-US>`-Block wäre abgelehnt worden. Die 500 Zeichen gelten **je Sprache**, nicht insgesamt.
    - Keine Geräte verloren (Telefon 12.319, Tablet 6.744, Auto 27, Chromebook 77, TV 8, XR 1 - alle unverändert), Installationsgröße 26,4 MB (+793 Byte).
    - Auf dem Gerät nachgeprüft: `versionCode=5`, `versionName=1.0.3`, `installerPackageName=com.android.vending`, Flags weiterhin ohne `ALLOW_BACKUP`. Der Store-Cache musste wieder mit `adb shell am force-stop com.android.vending` geräumt werden, erst danach erschien "Aktualisieren" - **dasselbe Verhalten wie bei 1.0.2, das ist also kein Einzelfall, sondern die Regel.** Da es ein Update und keine Neuinstallation war (`firstInstallTime` unverändert), blieben die Notfallkontakte erhalten; die App startete ohne Onboarding, ohne Geister-Aktivität und ohne Tracking-Warnung.
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
- [x] **Akkuverbrauch gemessen (Ausgangswert):** 29.09., 1,73 h Tracking bei 30-Sekunden-Takt, rund **10 %** - also knapp 6 % pro Stunde. Zur Gegenprobe der 27.09.: rund 8,9 h Tracking über den Tag, etwa 40 %, das sind 4,5 % pro Stunde (allerdings "mit allem", also inklusive sonstiger Nutzung). Auf einer Achtstundentour sind das 35 bis 50 %.
- [x] **Live-Link wird gedrosselt** (`shouldPushToRelay`, 30 Sekunden Mindestabstand). Der 10-Sekunden-Takt hätte die Zahl der Netzabfragen verdreifacht, und die Funkverbindung kostet mehr Strom als der GPS-Empfänger - der läuft bei `Accuracy.High` ohnehin durchgehend, unabhängig davon, wie oft die App das Ergebnis abholt. Für die Verfolgung ändert sich nichts: Der Live-Link war auch vorher auf die halbe Minute genau. Der erste Punkt nach dem Teilen geht sofort raus.
- [ ] **Verbrauch bei 10 s auf der nächsten Tour gegenprüfen.** Erwartung nach der Drosselung: kein nennenswerter Anstieg, weil der teure Teil (Funk) unverändert bleibt und der GPS-Empfänger ohnehin durchlief. Bestätigt sich das nicht, muss der Abstand wieder hoch oder sich nach der Geschwindigkeit richten.

## Empfehlungen aus der Play Console (für 1.0.2 umgesetzt)

- [x] **Edge-to-Edge (Android 15).** `edgeToEdgeEnabled` war bereits gesetzt, die eigentliche Lücke lag im Code: `SafeAreaProvider` stand zwar in `_layout.tsx`, aber **kein einziger Screen** hat die Insets je ausgewertet. Bei Edge-to-Edge zeichnet die App bis unter die Systemleisten - unten wäre damit ausgerechnet der SOS-Knopf hinter die Navigationsleiste geraten. Jetzt umschließt eine `SafeAreaView` mit `edges={['bottom']}` den gesamten Stack; das wirkt für alle Screens auf einmal, oben übernimmt weiter der Stack-Header.
- [x] **Orientierung freigegeben (Android 16).** `app.json` stand auf `"orientation": "portrait"`, was ein `android:screenOrientation="portrait"` ins Manifest schreibt. Ab Android 16 ignorieren Geräte mit großem Display diese Einschränkung ohnehin, und die Play Console mahnt sie an. Steht jetzt auf `"default"`. Die App zielt auf `targetSdk 36`, die Regel greift also.
  - [x] **Im Querformat am Gerät geprüft** (30.09.2026, eigener Release-Build). Die Sorge war berechtigt: Bei 2670x1200 ist vom Startbildschirm nur bis „Aktivität aktiv seit ..." zu sehen, der SOS-Knopf liegt unterhalb der Kante. Der Startbildschirm hat deshalb eine `ScrollView` bekommen (`flexGrow` statt `flex`, damit sich im Hochformat nichts ändert) - damit ist der Knopf durch Wischen erreichbar, verifiziert per Screenshot.
  - [ ] Der SOS-Knopf ist im Querformat erst nach dem Scrollen sichtbar. Für den Normalfall verschmerzbar, weil die App im Hochformat benutzt wird und das Querformat nur wegen der Android-16-Vorgabe offen ist. Ein eigenes, zweispaltiges Querformat-Layout wäre die saubere Lösung - erst sinnvoll, wenn es Rückmeldungen von Tablet-Nutzern gibt.

## Android-Cloud-Backup abgeschaltet (30.09.2026)

Beim Prüfen des Querformats zufällig entdeckt und der wichtigste Fund des Tages.

- [x] **Symptom:** Nach `adb uninstall` und Neuinstallation zeigte die App sofort wieder „Aktivität aktiv seit 20:57 Uhr" und den hinterlegten Notfallkontakt - bei nachweislich frischer Installation (`firstInstallTime` drei Minuten alt). Auch das Onboarding wurde übersprungen.
- [x] **Ursache:** `android:allowBackup="true"` stand im Manifest - der Android-Standard. Das Betriebssystem sichert App-Daten automatisch im Google-Konto des Nutzers und spielt sie bei einer Neuinstallation zurück.
- [x] **Warum das schlimm ist:** Die Datenschutzerklärung sagt wörtlich zu, alle Standortdaten und Notfallkontakte würden „**ausschließlich lokal in der App gespeichert**". Tatsächlich lagen Standortspuren und Telefonnummern in einem Google-Cloud-Backup. Für eine App, die sich genau über Datensparsamkeit von SOS-EU-ALP abgrenzt (siehe die Antwort an die Leitstelle Tirol), war das ein Widerspruch zwischen Zusage und Verhalten.
- [x] **Behoben:** `"allowBackup": false` in `app.json`, per Prebuild ins Manifest gezogen und dort nachgeprüft. Datenschutzerklärung in beiden Sprachen ergänzt - die Abschaltung wird jetzt ausdrücklich benannt, samt der Kehrseite (nach einem Gerätewechsel sind die Notfallkontakte weg).
- [ ] **Offen: Bestehende Backups.** Bei allen, die 1.0.0 oder 1.0.1 installiert hatten, liegt womöglich noch ein Backup im Google-Konto. Das Abschalten verhindert neue Sicherungen, löscht aber keine alten. Klären, ob und wie sich das aus der Ferne bereinigen lässt - bisher betrifft es nur Stephans eigenes Gerät, weil sonst noch niemand die App installiert hat. **Vor dem Einladen der übrigen elf Tester erledigen.**

## Aktivität ohne laufende Aufzeichnung (30.09.2026)

Aus der Geisteraktivität von oben entstanden - der ernsteste der heutigen Funde.

- [x] **Die App hat nicht heimlich getrackt.** Das Batterieprotokoll des Geräts zeigt für den 29.09. genau einen Vordergrunddienst: `+fg` um 18:07:20, `-fg` um 19:51:58. Danach bis zur Neuinstallation heute um 07:32 keinen einzigen mehr. Es gab einen Datenbankeintrag auf "aktiv", zu dem nie ein Dienst lief.
- [x] **Der Weg dorthin stand im Code.** `startHike()` legte die Zeile per `createHike()` an und rief erst danach `startBackgroundLocationTracking()`. Schlug das fehl, blieb die Aktivität stehen: Der Startbildschirm zeigte "Aktivität aktiv seit ...", während nichts aufgezeichnet wurde. Für eine Notfall-App der gefährlichste denkbare Zustand - **ein Start, der sichtbar scheitert, ist harmlos; einer, der scheitert und Erfolg meldet, ist es nicht.**
- [x] Verschärfend: `startLocationUpdatesAsync` lief ohne `try/catch`. Android kann das Anmelden ablehnen, ohne dass eine Berechtigung fehlt; die Ausnahme flog dann bis in den Aufrufer, sodass nicht einmal die Fehlermeldung erschien.
- [x] **Behoben, dreifach:** Ausnahme wird zu `{success: false, reason: 'start_failed'}`; scheitert der Start, räumt `startHike()` die Aktivität per `deleteHike()` wieder weg (löschen statt "beenden" - eine Tour, die nie begann, gehört nicht in die Liste); beim Wiederaufnehmen nach einem Prozess-Neustart lässt sich nicht löschen (dort können echte Punkte liegen), stattdessen reicht der Hook `trackingActive` nach oben und der Startbildschirm warnt in Rot.
- [ ] Nicht mehr rekonstruierbar, wie der Eintrag vom 29.09. um 20:57 konkret entstanden ist - die Datenbank ging mit der Deinstallation verloren, bevor der Zusammenhang klar war. **Lehre fürs nächste Mal: bei einem unerklärlichen Zustand zuerst sichern, dann aufräumen.**

## Funktionsprüfung 1.0.2 am Gerät (30.09.2026)

Stephan kann die nächsten Tage nicht auf Tour, deshalb ein Schreibtischtest mit eigenem Release-Build. Das deckt Migration, Startvorgang und Anzeige ab, nicht aber Bewegung.

- [x] Datenbank-Migration läuft sauber durch (neue Spalte `altitude` per `PRAGMA table_info` geprüft statt blindem `ALTER TABLE`), Onboarding erscheint, Kontakt lässt sich speichern.
- [x] Aktivität startet, `+fg` im Batterieprotokoll um 08:02:00 nachgewiesen, Startzeit wird korrekt angezeigt.
- [x] **Die neue Warnung erscheint nicht, wenn alles läuft** - kein Fehlalarm.
- [ ] **Nicht abgedeckt: alles, was Bewegung braucht.** Der 10-Sekunden-Takt, die Plausibilitätsprüfung und die Höhenmeter sind im Feld ungetestet.

## Release-Build: was beim Bauen von 1.0.3 im Weg stand (01.10.2026)

Drei Stolpersteine, alle beim nächsten Mal wieder da. Reihenfolge der Befehle:

```
npx expo prebuild --platform android
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
export ANDROID_HOME=/home/stephan/Android/Sdk
cd android && ./gradlew bundleRelease
```

- **`prebuild` löscht `android/` komplett und baut es neu.** Damit ist auch `android/local.properties` weg, in dem der SDK-Pfad steht - der Build bricht dann mit "SDK location not found" ab. Deshalb `ANDROID_HOME` setzen statt die Datei zu suchen. Der Signierschlüssel ist davon **nicht** betroffen: Die Zugangsdaten liegen in `~/.gradle/gradle.properties` und der Schlüssel selbst unter `~/keystores/`, beides außerhalb des Repos.
- **Java 26 ist zu neu.** Der Android-Build scheitert an `jlink` ("Failed to transform core-for-system-modules.jar"). Java 21 ist installiert und funktioniert. Das System steht auf 26, also muss `JAVA_HOME` bei jedem Build gesetzt werden. Läuft schon ein Gradle-Daemon mit der falschen Version, hilft `./gradlew --stop` davor.
- **Die Signatur gehört nachgeprüft.** In `build.gradle` steht eine Rückfallregel: Fehlt die Property `NTG_UPLOAD_STORE_FILE`, wird **stillschweigend mit dem Debug-Schlüssel signiert**. Das AAB entsteht trotzdem, und Google lehnt es erst beim Hochladen ab. Gegenprobe: Das Zertifikat aus `META-INF/*.RSA` im AAB muss denselben SHA256-Fingerabdruck haben wie `~/keystores/naturlusttrailguide-release.jks`.

Ergebnis 1.0.3: 70,0 MB, `versionCode 5`, `versionName 1.0.3`, Signatur gegen den Upload-Keystore geprüft (`13:3D:75:E3:…`).

---

## Dritte Vergleichsmessung (30.09.2026, Wanderung) - ausgewertet am 01.10.2026

Zwei Stunden Wanderung, 4,2 km, Garmin/Komoot parallel. Ergebnis in einem Satz: **Die Strecke war so gut wie nie, die Höhenangabe war frei erfunden.** Daraus ist 1.0.3 entstanden. Die ausführliche Fassung steht in [docs/fehleranalyse-september-2026.md](docs/fehleranalyse-september-2026.md), Punkte 10 und 11.

- [x] **Bergtour bevorzugen** - wurde eine Wiesenwanderung mit rund 30 echten Höhenmetern. Hat sich trotzdem als der wertvollere Fall erwiesen: Gerade weil kaum Höhe drin war, fiel auf, dass die App +496 m meldete. An einem echten Berg wäre derselbe Fehler als "etwas zu viel" durchgegangen.
- [x] **Akkustand notieren** - 65 % auf 51 % in 1 h 58 min = **7,1 % pro Stunde**, Bildschirm dabei 94 % der Zeit aus. Gegenüber knapp 6 % beim 30-Sekunden-Takt kostet die Verdreifachung der Messrate also rund einen Prozentpunkt pro Stunde. **Das Intervall bleibt bei 10 Sekunden.** Zum Vergleich: Nach dem Tourende sank der Stand bei eingeschaltetem Bildschirm mit 16 % pro Stunde.
- [x] **Mehrere Standorte teilen** - viermal, Abweichung 3,6 / 6,6 / 7,9 / 30,8 m. Dreimal davon näher an der Wahrheit als die Garmin-Uhr. Das Batterieprotokoll bestätigt die Uhrzeiten unabhängig (Bildschirm an um 17:29, 17:36, 17:53, 18:48).
- [x] **Offene Frage vom 29.09. beantwortet: Ja, die Schwelle war zu lasch.** Der einzige schlechte Punkt der Tour meldete **47,4 m** - knapp unter der Grenze von 50. Er allein machte 255 m aus, also 83 % des Streckenfehlers. Grenze fürs Aufzeichnen jetzt bei 30 m; beim Teilen eines Einzelstandorts bleibt es bei 50 m, weil es dort keine Alternative gibt.
- [x] **Die täuschende Zahl, zum zweiten Mal.** −1,3 % gegen die volle Referenz, +7,1 % gegen die auf unseren Takt ausgedünnte. Dasselbe Muster wie am 29.09. Die Gegenprobe mit Ausdünnung gehört ab jetzt fest zur Auswertung.
- [ ] Prüfen, ob der Plausibilitätsfilter bei einer schnellen Abfahrt echte Punkte verwirft. Auf dieser Tour hat er zwei Punkte angefasst (46 und 52 km/h), beide zu Recht - über 90 km/h hat er weiterhin nie gesehen.
- [ ] **Höhenverfahren an einer echten Bergtour gegenprüfen.** Es ist gegen einen konstruierten Berg abgesichert (dieselben Zeitstempel, dasselbe Rauschen, 800 echte Höhenmeter → gemeldet 758 m), aber echte Daten mit nennenswertem Anstieg fehlen weiterhin. Das ist der wichtigste offene Punkt für die nächste Messung.
- [ ] Der `<ele>`-Wert im GPX-Export trägt einen systematischen Versatz von rund +40 m (Android misst über dem WGS84-Ellipsoid, Karten rechnen über dem Meeresspiegel; die Geoidundulation beträgt hier rund 48 m). Auf die Höhendifferenz wirkt sich das nicht aus, auf eine absolute Angabe sehr wohl. Solange die App keine absolute Höhe anzeigt, ist es nur eine Ungenauigkeit im Export - dokumentiert, nicht behoben.

## FEHLER: Der Live-Link überlebt das Beenden der Aktivität (gefunden 04.10.2026)

**Schwere: hoch.** Widerspricht der Kernzusage der App.

`endHike` in `src/hooks/useActiveHike.ts` stoppt die Aufzeichnung, löscht die Standortpunkte und entfernt den Tourkontakt – **ruft aber `stopLiveShare` nie auf.** Die Funktion `revokeTrackLink` existiert und funktioniert, sie wird an dieser Stelle schlicht nicht verwendet.

Folgen:
- Der Token bleibt auf dem Relay, bis seine Laufzeit abläuft – **standardmäßig sechs Stunden** (`DEFAULT_TTL_MINUTES = 360`, Obergrenze 24 h).
- Der Link zeigt weiter die zuletzt übertragene Position. Sie ist eingefroren, aber abrufbar.
- **Die App kann ihn danach nicht mehr widerrufen**, weil der Token an der Aktivität hängt und `useShareLink` ohne aktive Tour nichts findet. Der Nutzer hat keinen Weg mehr, ihn loszuwerden.

Gefunden, weil Stephan nach der Radtour am 04.10.2026 fragte, ob sein Standort noch geteilt wird. Die Tour endete 16:42 Uhr, der Link wäre bis rund 22:42 Uhr erreichbar gewesen.

Das ist derselbe Widerspruch wie seinerzeit beim Android-Cloud-Backup: Die App verspricht, dass nach einer normalen Tour nichts zurückbleibt, und lässt dann doch etwas zurück.

- [x] **Behoben am 04.10.2026.** `endHike` widerruft den Live-Link jetzt, bei Vorfall wie ohne. Drei Dinge waren dabei zu beachten:
  - **Der Token wird frisch aus der Datenbank gelesen**, nicht aus dem State des Hooks – der Link kann in einem anderen Screen gestartet worden sein, ohne dass dieser Hook seitdem aktualisiert hat.
  - **`revokeTrackLink` hat jetzt ein Zeitlimit von 5 Sekunden.** Das war beim Bauen die eigentliche Gefahr: Der Aufruf steht im Weg des Nutzers, der gerade „Aktivität beenden" getippt hat, und `fetch` ohne Zeitlimit kann am Ende einer Bergtour ohne Netz minutenlang hängen. Lieber ein nicht widerrufener Token – dessen Ablaufzeit greift ohnehin – als eine App, die sich beim Beenden aufhängt.
  - **Der lokale Eintrag wird in jedem Fall gelöscht**, auch wenn der Widerruf scheitert. Einen Token zu behalten, den nach dem Beenden niemand mehr aufruft, würde in der Oberfläche nur einen Link vorspiegeln, der niemandem mehr gehört.
  - Acht neue Tests decken genau die unangenehmen Fälle ab: kein Netz, Relay kennt den Token nicht, Verbindung antwortet nie.
### Der schwerere zweite Fehler, beim Nachsehen gefunden

Stephans Verdacht am 04.10.2026 – „ich kann den Live-Link aktivieren und in der App wieder deaktivieren, und das funktioniert wohl nicht" – traf zu, und zwar auf einen eigenständigen, schwerwiegenderen Fehler.

`useShareLink` las Token und Status **nur aus den Anfangswerten von `useState`**. Die greifen aber ausschließlich beim ersten Rendern – und `useActiveHike` lädt die Tour in einem Effekt, beim ersten Rendern ist sie deshalb **immer** null. Kam sie einen Augenblick später mit einem laufenden Link herein, blieb der Hook auf `idle` und `token` auf null; `stop()` stieg bei `if (!hike || !token) return;` sofort wieder aus.

**Betroffen war jeder, der den SOS-Bereich zwischendurch verlassen oder die App neu gestartet hatte.** Die Oberfläche zeigte dann gar keinen aktiven Link mehr – der Nutzer wusste also nicht einmal, dass es etwas abzuschalten gab.

Die Ironie: Der Kommentar über dem Hook erklärte genau diese Gefahr („`hike` wird nach dem Start des Links nicht automatisch neu geladen und wäre beim Beenden veraltet"). Die Absicht war richtig, nur übersieht man leicht, dass `useState`-Anfangswerte nicht erneut ausgewertet werden.

- [x] **Behoben am 04.10.2026** durch einen Abgleich-Effekt. Drei Feinheiten dabei:
  - Übernommen wird nur, wenn der Hook selbst noch keinen Token hat – sonst überschriebe das veraltete `hike`-Objekt einen gerade frisch gestarteten Link.
  - **Abgeschaltete Token werden gemerkt.** In diese Falle bin ich beim Bauen selbst gelaufen: Nach `stop()` trägt das hereingereichte Objekt noch eine Weile den alten Token, und der Abgleich hat ihn prompt wieder übernommen – der Link sah weiter aktiv aus, obwohl er widerrufen war. Ein Test hält das jetzt fest.
  - Die Adresse wird aus dem Token rekonstruiert (`buildViewUrl`). Sie steht nicht in der Datenbank, und die Oberfläche blendet den Abschalt-Knopf ohne sie aus – ein übernommener Link wäre sonst weiterhin nicht abschaltbar gewesen.
- [x] **Am Gerät durchgespielt (04.10.2026).** Nach einem App-Neustart erkennt die App den laufenden Link, baut die Adresse wieder auf und zeigt „Freigabe beenden" – genau der Knopf, der vorher fehlte. Der Stillstandshinweis stand dabei auch gleich auf der Verfolgerseite: *„Person bewegt sich nicht. Position seit 19:00 Uhr unveraendert (seit 19 Minuten)."*

### Was erst der Gerätetest gezeigt hat: das Netz

Zwei weitere Fehler, die kein Unit-Test hätte finden können. Beide hängen an einer Netzeigenschaft des Testgeräts:

**Im WLAN „NaturlustNet" ist IPv6 kaputt.** Der Router vergibt eine echte globale IPv6-Adresse (`2001:4bb8:…`), das Gerät hält IPv6 also für benutzbar – aber TCP über IPv6 läuft ins Leere:

```
TCP über IPv6 (Port 443):  Timeout, keine Verbindung
TCP über IPv4 (Port 443):  verbunden
```

Android versucht deshalb zuerst IPv6 und fällt erst nach dem TCP-Timeout auf IPv4 zurück. Das erklärt die fünf Minuten.

**Korrektur einer Fehlzuordnung:** Zuerst stand hier „Mobilfunknetz". Das war falsch – alle Messungen am 04.10.2026 liefen über das Heim-WLAN, das Gerät hing die ganze Zeit an „NaturlustNet". Stephans Einwand brachte es ans Licht: Auf der Radtour desselben Tages, unterwegs über Mobilfunk, **hat** der Live-Link funktioniert. **Über Mobilfunk-IPv6 liegt keine einzige Messung vor.** Für die Praxis heißt das: Der Fall trifft eher zu Hause beim Ausprobieren als unterwegs im Ernstfall.

Nebenbefund für Stephan selbst: Ein WLAN, das IPv6 bewirbt und dann nicht liefert, bremst **jede** Verbindung zu einem Server mit AAAA-Eintrag beim ersten Zugriff aus – nicht nur unsere App. Ein Blick in die Router-Einstellungen lohnt sich unabhängig von diesem Projekt.

- [x] **Das Starten hing fünf Minuten.** Der Knopf zeigte „Wird gestartet…", ohne Rückmeldung und ohne Abbruch; der Link wurde am Ende sogar angelegt, nur hatte das niemand mehr mitbekommen. `createTrackLink` hat jetzt ein Zeitlimit von 20 Sekunden – danach scheitert der Versuch ehrlich und der Knopf wird wieder bedienbar.
- [x] **Mein eigenes 5-Sekunden-Limit für den Widerruf war zu knapp** und würgte ihn jedes Mal ab: Die App vergaß den Link, der Token lebte weiter. Der Widerruf blockiert jetzt gar nicht mehr – lokal wird sofort vergessen, der Widerruf läuft nebenher – und darf deshalb großzügige 30 Sekunden brauchen.
- [x] **Der erste Fehlversuch blieb stumm.** `liveShare.status` stammt aus dem Render, der die Funktion erzeugt hat, und ist nach dem `await` veraltet. Die Meldung erschien erst ab dem zweiten Versuch, weil die Closure dann den Fehlerzustand des ersten trug. Jetzt entscheidet der Rückgabewert.

- [x] **Verworfen: den Relay auf reines IPv4 umstellen.** Stand hier kurz als Vorschlag und ist nach Stephans Einwand vom Tisch – aus zwei Gründen, die beide gegen ihn sprechen:
  - **Das Problem tritt im Einsatz nicht auf.** Die App wird draußen über Mobilfunk benutzt, nicht im WLAN. Betroffen ist genau ein Netz, und zwar das Heimnetz, in dem getestet wird. Auf der Radtour desselben Tages lief der Live-Link über Mobilfunk ohne Auffälligkeit.
  - **Es wäre sogar schädlich.** Mobilfunknetze gehen zunehmend auf IPv6-only mit NAT64 über – auch Stephans Mobilfunkanschluss hat eine globale IPv6-Adresse. Einen Server künstlich auf IPv4 zu beschränken, würde genau die Netze benachteiligen, in denen die App tatsächlich läuft, um ein Problem zu lösen, das nur am Schreibtisch auftritt.

  **Lehre daraus, nicht den Code betreffend:** Ein Befund aus der Testumgebung ist kein Befund aus dem Einsatz. Die Zeitlimits bleiben trotzdem richtig – ein Knopf, der ohne Rückmeldung endlos dreht, ist bei schwachem Empfang im Gebirge genauso falsch wie im kaputten WLAN. Nur die Begründung dafür ist eine andere als zunächst notiert.
- [ ] Die Verfolgerseite schreibt „unveraendert" und „oeffnen" ohne Umlaute. Innerhalb der Datei konsequent, aber es ist die Seite, die eine Bergrettung zu sehen bekommt – dort gehören richtige Umlaute hin.

- [ ] Prüfen, ob ein verwaister Token sich auch ohne die App widerrufen lässt (Relay-Endpunkt `POST /api/track/:token/revoke` existiert und braucht keine Anmeldung – das ist einerseits der Notausgang, andererseits selbst eine Frage wert).
- [ ] Überlegen, ob die Standardlaufzeit von sechs Stunden zu lang ist. Sie stammt aus der Annahme einer Tageswanderung; nach dem Fix wäre sie nur noch für den Fall relevant, dass die App beim Beenden kein Netz hat.

---

## Release 6 (1.0.4) ist live (03.10.2026)

Eingereicht gegen 19:50 Uhr, veröffentlicht vor 20:19 Uhr. Die Vorabprüfungen dauerten diesmal auffällig lange – die angezeigte Restzeit fiel in acht Minuten nur von 7 auf 6 Minuten –, die eigentliche Prüfung danach wie gewohnt.

- Auf dem Gerät nachgeprüft: `versionCode=6`, `versionName=1.0.4`, `installerPackageName=com.android.vending`, Flags weiterhin ohne `ALLOW_BACKUP`. Es war ein Update, keine Neuinstallation (`firstInstallTime` unverändert) – die Notfallkontakte sind erhalten, die App startete ohne Onboarding und ohne Geister-Aktivität.
- **Zwei Dinge sind jetzt endgültig als Regel bestätigt, nicht als Einzelfall:** Das hochgeladene AAB lag zum zweiten Mal in Folge nur in der Bundle-Bibliothek und hing an keinem Release. Und der Play Store bot zum dritten Mal in Folge erst nach `adb shell am force-stop com.android.vending` die neue Fassung an. Beides gehört in die Testereinladung.
- **Signaturen, am Gerät gemessen** (für die Frage nach Fremdstores und einem APK auf der Homepage): Die Store-Fassung ist mit **Googles** Schlüssel signiert (`CN=Android, O=Google Inc.`, SHA-256 `79e3db78…`), nicht mit dem Upload-Keystore (`13:3D:75:E3…`). Ein selbst ausgeliefertes APK trägt den Upload-Schlüssel; Android verweigert dann das Update und verlangt eine Deinstallation – **womit die Notfallkontakte verloren gehen**, weil das Cloud-Backup abgeschaltet ist. Das muss auf jede Downloadseite, sonst verliert jemand seine Kontakte, ohne es zu merken.

---

## Relay-Server: Ausrollen gehört ab 1.0.4 dazu (03.10.2026)

Der Stillstandshinweis ist die erste Änderung, die **beide Seiten** betrifft. Ein neuer App-Build allein reicht nicht: Ein Server alter Fassung verwirft das Feld `stationarySince` stillschweigend, der Hinweis erschiene also nie, ohne dass irgendwo ein Fehler sichtbar würde.

```
cd "/mnt/raid/eigene Daten/GitHub/Stephan-Lefty/NaturlustTrailGuide/server" && npx wrangler deploy
```

Den Befehl muss Stephan selbst ausführen – der Sicherheitsfilter blockt ihn bei mir zuverlässig, wie bei den Werkzeugen von naturlust.net auch.

Gegenprobe nach dem Ausrollen (Link anlegen, Standort mit Stillstand senden, zurücklesen, Link wieder entfernen) – am 03.10.2026 durchgeführt, Feld kommt durch, Anzeigeseite trägt den Text. **Reihenfolge beachten: erst Server, dann App.** Umgekehrt wäre die App kurzzeitig mit einem Server unterwegs, der ihre Meldung nicht kennt.

---

## Vierte Vergleichsmessung (03.10.2026, Scharnitz – Birzlkapelle – Karwendelsteg)

Sechs Stunden, 10,2 km, endlich mit echten Höhenmetern. Garmin/Komoot parallel. Daraus ist 1.0.4 entstanden. Ausführlich in [docs/fehleranalyse-september-2026.md](docs/fehleranalyse-september-2026.md), Punkte 12 und 13.

**Die Messdaten liegen unter `~/Dokumente/TrailGuide-Messungen/`** – nicht im Repo (echte Koordinaten) und nicht im Download-Ordner, aus dem die Dateien vom 30.09. verschwunden sind. Ohne sie fehlt die Vergleichsgrundlage für jede künftige Änderung am Höhenverfahren.

- [x] **Strecke: −2,6 %** gegen die auf unseren Takt ausgedünnte Referenz (10,185 gegen 10,454 km) – das beste Ergebnis bisher. Die Spur liegt im Median 8,2 m neben der Garmin-Uhr, 90 % unter 15,5 m, nur 2 von 1039 Punkten über 50 m daneben.
- [x] **Drei geteilte Standorte: 1,6 / 10,0 / 11,3 m** neben dem zeitgleichen Garmin-Punkt.
- [x] **Akku: 6,7 %/h** (98 % auf 56 % über 6,28 h, Bildschirm 4 % der Zeit an). Deckt sich mit den 7,1 % vom 30.09.; eine Tagestour kostet gut 40 %.
- [x] **Höhenverfahren an echten Höhenmetern geprüft** – der offene Punkt aus der dritten Messung. Ergebnis: +311 statt +244 m, also 27 % zu hoch. Das alte Verfahren hätte +465 ergeben. Die Rast beweist, dass die Glättung arbeitet: drei Stunden am selben Fleck ergeben **+0 Höhenmeter**.
- [x] **Höhengenauigkeit wird seit 1.0.4 mitgeschrieben**, aber noch nicht ausgewertet. Grund: Drei Höhensprünge von 127–136 m kamen mit einer *horizontalen* Genauigkeit von 2–5 m herein. Die Parametersuche verhielt sich nicht monoton (120 s/30 m → +311, 120 s/40 m → +320, 180 s/30 m → +287) – daran weiterzudrehen hieße, Rauschen zu optimieren.
- [x] **Stillstandshinweis im Live-Link gebaut** (Stephans Vorgabe 03.10.): „Person bewegt sich nicht. Position seit … Uhr unverändert." Umkreis 25 m, Meldung nach 5 Minuten, beides an der echten Tour geprüft.
- [ ] **Der allererste Punkt jeder Tour wird ungeprüft übernommen.** Heute meldete er 93 m Genauigkeit und lag 129 m daneben – der schlechteste Punkt der ganzen Tour. Das ist Absicht (ohne Vorgänger gibt es nichts zu vergleichen), aber man könnte ihn durch einen besseren ersetzen, sobald innerhalb der ersten Minute einer kommt. **Noch nicht entschieden.**
- [ ] Prüfen, ob der strengere Genauigkeitsfilter (30 m, seit 1.0.3) in Wald oder enger Schlucht zu viele Punkte verwirft. Auf dieser Tour war genau ein Punkt über 30 m – und das war der erste.

### Testplan für die fünfte Vergleichsmessung

- [ ] **Die Höhengenauigkeit aus dem GPX auswerten.** Das ist der Hauptzweck dieser Messung: Meldet Android bei den groben Höhensprüngen einen auffälligen Wert? Wenn ja, lässt sich daraus ein Filter bauen und die verbliebenen 27 % angehen. Wenn nein, ist die Höhenangabe mit Bordmitteln nicht weiter zu verbessern – auch das wäre ein Ergebnis und gehört dann ehrlich in die Doku.
- [ ] **Den Stillstandshinweis im Ernstfall-Nachbau prüfen.** Einmal zehn Minuten wirklich stillhalten (Handy ablegen, nicht in der Hand) und den Live-Link von einem zweiten Gerät beobachten. Erscheint die Meldung, und stimmt die Uhrzeit?
- [ ] Wieder mehrere Standorte teilen und die Uhrzeiten notieren.
- [ ] Akkustand bei Start und Ende notieren (Vergleichswerte: 7,1 und 6,7 %/h).
- [ ] Mit „Es gab einen Vorfall" beenden, sonst löscht die App die Aufzeichnung.

### Testplan für die vierte Vergleichsmessung (erledigt)

Referenzgerät weiterhin mitlaufen lassen - **ja.** Drei Messungen, drei Funde, die ohne Vergleichstrack nie aufgefallen wären. Aufhören lässt sich damit, wenn zwei Touren hintereinander nichts Neues zeigen.

- [ ] **Jetzt wirklich eine Bergtour.** Siehe oben: Das Höhenverfahren ist der einzige Teil, der nur gegen konstruierte Daten geprüft ist.
- [ ] Akkustand bei Start und Ende notieren (Vergleichswert: 7,1 % pro Stunde).
- [ ] Wieder mehrere Standorte teilen und die Uhrzeiten notieren - war in allen drei Messungen die wertvollste Einzelangabe, und sie ist laut ÖAV genau die, auf die es ankommt.
- [ ] Mit "Es gab einen Vorfall" beenden, sonst löscht die App die Aufzeichnung.
- [ ] Gegenprüfen, ob der strengere Genauigkeitsfilter (30 m) in Wald oder enger Schlucht zu viele Punkte verwirft. Auf offener Wiese waren es 2 von 385 - in schlechtem Gelände könnte das anders aussehen. Die Fünf-Minuten-Regel fängt den Extremfall ab, aber eine dünnere Spur wäre trotzdem zu sehen.
- [x] **Wo das Rauschen sitzt: in einem einzigen Fenster.** Die Tour in Viertelstunden zerlegt und jeden Abschnitt gegen den ausgedünnten Referenztrack gestellt. Sechs von sieben Abschnitten liegen zwischen -0,32 und +0,37 km. Ein einziger, 18:51-19:06, liegt bei **+1,43 km** - das ist praktisch das gesamte Rauschen der Tour. Stephan hat bestätigt: Dort stand er still, um Schatzi abzuholen. Auf der Heimfahrt danach betrug die Abweichung gegen den ausgedünnten Referenztrack **-0,2 %**.
- [x] **Ursache sind keine Stillstandszappler, sondern echte Fehlortungen.** Erste Vermutung war kleines Zittern der Position im Stand, das sich zu Kilometern summiert. Eine Mindestdistanz je Segment hätte das aufgelöst - sie brachte aber selbst bei 40 m nur 0,22 von 1,02 km. Der Blick auf die Einzelsegmente zeigte den Grund: Sprünge von 470 bis 834 m, drei davon um 18:52, 18:54 und 18:57, der größte mit 163 km/h. Im Stand ist der Empfang am schlechtesten (keine Mittelung über die Bewegung, dafür Reflexionen und WLAN-Ortung), und das Gerät meldet trotzdem unauffällige Genauigkeitswerte.
- [x] **Plausibilitätsprüfung eingebaut** (`isPlausibleMove` in `locationQuality.ts`). Verworfen wird der **Punkt**, nicht das Segment - das ist der Unterschied zum verworfenen Ansatz oben. Drei Sicherungen, alle mit Tests: nach über zwei Minuten Funkstille wird nicht geurteilt (nach einem Tunnel ist ein weiter Sprung echt), nach drei Verwerfungen hintereinander wird wieder angenommen (sonst hängt die Kette an einem falschen Ankerpunkt und die Aufzeichnung reißt für den Rest der Tour ab), und ohne verstrichene Zeit wird nicht geurteilt (gebündelt nachgelieferte Standorte tragen denselben Zeitstempel).
  - Bei den Kilometern bringt das nur +1,6 Prozentpunkte (von +5,3 auf +3,7 %). **Der Grund, es trotzdem zu bauen, ist ein anderer:** Diese Punkte gingen bisher auch an den Live-Standort-Link. Ein Retter hätte die Position mehrere hundert Meter neben der Route gesehen. Die Kilometerzahl ist Kosmetik, ein falscher Standort im Ernstfall ist es nicht.
  - Gegenprobe auf der Heimfahrt: **0 Punkte verworfen.** Wo nichts kaputt ist, macht der Filter auch nichts kaputt.
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
- [x] **Die Nachricht nennt jetzt die Genauigkeit** und wartet vorher kurz auf einen guten Fix (`shareAccuracy.ts`, mit Tests). Bisher standen dort nur Koordinaten und Maps-Link - bei 30 m unerheblich, bei 300 m gefährlich, und der Empfänger konnte beides nicht unterscheiden. Neu: "auf etwa 12 m genau" bzw. bei schlechtem Empfang "ACHTUNG: nur ungefähr! Ich kann bis zu 250 m von diesem Punkt entfernt sein." Das Warten ist auf 12 Sekunden begrenzt und bricht ab, sobald ein brauchbarer Fix da ist - im Ernstfall darf die Nachricht nicht an einer Wartezeit hängen.

### Was bei einer Pause passiert - und damit im Ernstfall

Stephans Frage nach der Auswertung: Was bedeutet das, wenn jemand Pause macht oder auf Rettung wartet? Das ist die wichtigste Frage der ganzen Messung, denn **wer verletzt liegt, bewegt sich nicht.** Nachgemessen an der bestätigten Standzeit von 18:51 bis 19:06:

- [x] **Stillstand an sich ist nicht das Problem.** Der Referenztrack zeigt in sieben Standphasen eine Streuung von unter 3 m um den Mittelpunkt, im Median unter 1 m. Ein Gerät mit gutem Fix bleibt im Stand ruhig liegen.
- [x] **Das Problem ist der Verlust des Fixes, den das Gerät nicht zugibt.** Unsere Aufzeichnung lief von 18:52:42 bis 18:56:48 - über vier Minuten - durchgehend 50 bis 245 m neben der tatsächlichen Position. Kein Zappeln, sondern ein systematischer Versatz: Das Handy hatte offensichtlich auf Funkzellen- oder WLAN-Ortung umgeschaltet und meldete trotzdem unauffällige Genauigkeitswerte. Um 18:57:29 war es wieder bei 2 m.
- [x] **Mittelung über mehrere Messungen hilft dagegen nicht.** Durchgerechnet: In der schlechtesten Standphase der Referenz verbessert der Mittelwert aus 20 Messungen den Fehler von 1,1 auf 0,4 m - dort, wo ohnehin alles gut ist. Gegen einen systematischen Versatz ist Mittelung wirkungslos, weil alle Messungen gleich falsch sind.
- [ ] **Der einzige belastbare Hebel ist Ehrlichkeit über die Unsicherheit.** Deshalb stehen Genauigkeit im Live-Viewer und jetzt auch in der einmaligen Nachricht. Was noch fehlt: Ein Hinweis an den Verfolger, wenn die Position über mehrere Minuten hinweg verdächtig wirkt (etwa stabile Koordinaten bei gleichzeitig springender Genauigkeit).
- [ ] **Offene Frage für die nächste Messung:** Welche Genauigkeit hat das Gerät in diesen vier Minuten eigentlich gemeldet? Lag sie unter 50 m, muss die Schwelle sinken. Genau dafür steht die Genauigkeit seit 1.0.2 im GPX-Export - beim nächsten Vergleich ist die Frage beantwortbar.

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
    - **Zweite Absage am 06.10.2026**, auf Stephans Rückfrage vom 24.09., ob die App später über ihre Homepage präsentiert werden könnte: "nein tut mir leid, das ist nicht möglich". Ohne Begründung, vom Bürobetrieb, nicht aus der Fachabteilung. **Damit ist dieser Weg zu — nicht erneut anfragen.** Einordnung: Eine Rettungsorganisation, die eine private Sicherheits-App auf ihrer Seite zeigt, spricht damit faktisch eine Empfehlung aus und steht für die Erwartungen ein, die daraus im Notfall entstehen. Das wäre bei jedem Anbieter dieselbe Antwort und ist kein Urteil über die App — die erste Rückmeldung war fachlich wohlwollend. Tragfähiger ist der Weg über einzelne Fachleute in den Organisationen (siehe ÖAV), nicht über die Institution als Verteiler.
  - DAV und Bergrettung Tirol per Mail angeschrieben, bisher keine Rückmeldung
  - [x] Präsentation für das ÖAV-Gespräch erstellt und nach dem Gespräch aktualisiert (13 Seiten): Screenshots mit Erklärungen inkl. geöffneter Untermenüs, Detailfolie zu den 6 W-Fragen, Folie "Neu seit gestern Abend", Vergleich zu SOS-EU-ALP. Liegt unter `~/Schreibtisch/TrailGuide-Screenshots-OeAV/` - einmal normal und einmal als `..._druckbar.pdf` (Seiten fest gedreht, sonst druckt der Brother-Treiber leere Blätter).
  - [x] Kontaktnamen in allen Screenshots durch Phantasienamen ersetzt
  - [x] Mail mit allen Infos an Manuel Reindl verschickt (25.09.2026)
  - [x] Zweite Mail verschickt (30.09.2026) mit den Ergebnissen beider Vergleichsmessungen. Fachlich vorangestellt ist bewusst nicht die App, sondern der Befund zur Smartphone-Ortung bei Stillstand - über vier Minuten 50 bis 245 m daneben, bei unauffällig gemeldeter Genauigkeit. Das trifft genau den Ernstfall, denn wer verletzt liegt, bewegt sich nicht. Offene Frage an ihn: ob die Genauigkeitsangabe beim geteilten Standort in der umgesetzten Form für einen Retter taugt oder ob andere Angaben nötig wären. Der Textentwurf liegt außerhalb des Repos (enthält Namen und Anrede).
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

- [ ] **Alternative App-Stores prüfen** (Stephans Anstoß 03.10.2026, ausdrücklich „für das nächste Mal"). Zu klären wäre: **F-Droid** (verlangt quelloffenen Code und reproduzierbare Builds – das Repo ist offen, aber der Cloudflare-Relay und die Signierung müssten durchdacht werden), **Accrescent** (klein, aber auf Sicherheit und Datenschutz ausgelegt – passt inhaltlich gut zur App), **Aurora Store** (spiegelt nur Google Play, kein eigener Upload nötig) und **Huawei AppGallery**. Für eine App, die mit Datenschutz wirbt, ist vor allem F-Droid interessant: Dort erwarten die Nutzer genau diese Haltung. Zu bedenken: Jeder zusätzliche Store heißt ein weiterer Veröffentlichungsweg, der bei jeder Version mitgepflegt werden will – und bei F-Droid liegt der Build nicht mehr in unserer Hand.
- [ ] Umstieg von Cloudflare-Relay auf eigenen EU-Server (z.B. Hetzner, Docker neben bestehender Nextcloud) für den Live-Standort-Link
- [ ] Ggf. Umstieg von `expo-location`/`expo-task-manager` auf `react-native-background-geolocation` (kostenpflichtig), falls die gelegentlichen Tracking-Lücken (bis zu ~17 Min. bei längerem Stillstand beobachtet) im echten Einsatz zu einem Problem werden
