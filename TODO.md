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
  - [ ] Warten bis mind. 12 Tester-Mailadressen zusammen sind, dann in der E-Mail-Liste in Play Console eintragen
  - [ ] Release zur Überprüfung an Google senden ("Veröffentlichung - Übersicht"), Opt-in-Link an die Tester verschicken
  - [ ] 14-Tage-Frist abwarten, dann Produktionszugriff beantragen
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

## Qualitätssicherung

- [ ] Testen auf weiteren Android-Herstellern (Samsung, Xiaomi) - Motorola wurde bereits mehrfach über mehrere Stunden getestet, andere Hersteller drosseln Hintergrund-Apps teils stärker
- [ ] iOS-Build und -Test (bisher nur Android getestet)

## Später / optional

- [ ] Umstieg von Cloudflare-Relay auf eigenen EU-Server (z.B. Hetzner, Docker neben bestehender Nextcloud) für den Live-Standort-Link
- [ ] Ggf. Umstieg von `expo-location`/`expo-task-manager` auf `react-native-background-geolocation` (kostenpflichtig), falls die gelegentlichen Tracking-Lücken (bis zu ~17 Min. bei längerem Stillstand beobachtet) im echten Einsatz zu einem Problem werden
