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
  - [ ] Warten bis mind. 12 Tester-Mailadressen zusammen sind, dann in der E-Mail-Liste in Play Console eintragen
  - [ ] Release erstellen/hochladen, Opt-in-Link an die Tester verschicken
  - [ ] 14-Tage-Frist abwarten, dann Produktionszugriff beantragen
- [ ] Institutionelle Kontakte für Unterstützung/Reichweite angeschrieben (Details: [[project_trailguide_oeav_kontakt]] in Claudes Memory)
  - Manuel Reindl (ÖAV, Abteilung Bergsport): sehr interessiert, Gesprächstermin 24.09.2026, 20:30 Uhr (Videocall)
  - Bernd Noggler (Geschäftsführer Leitstelle Tirol): wies auf offizielle, seit 2018 etablierte App "SOS-EU-ALP" hin (direkt an Leitstelle angebunden); Stephan hat Datenschutz als Hauptunterschied herausgestellt (TrailGuide speichert standardmäßig nichts ohne Vorfall) und um Einschätzung/Unterstützung gebeten, Antwort steht noch aus
  - DAV und Bergrettung Tirol per Mail angeschrieben, bisher keine Rückmeldung
  - [x] Präsentation für das ÖAV-Gespräch erstellt: aktuelle Screenshots (mit Erklärungen) + Vergleich zu SOS-EU-ALP als PDF im Querformat, liegt unter `~/Schreibtisch/TrailGuide-Screenshots-OeAV/NaturlustTrailGuide_Praesentation_OeAV.pdf`
- [x] Google Play Console: Alle App-Inhalte-Deklarationen abgeschlossen (Datenschutzerklärung, Anmeldedaten, Anzeigen, Altersfreigaben/IARC, Zielgruppe, Datensicherheit, Behörden-Apps, Finanzfunktionen, Werbe-ID, Gesundheits-Apps)
- [ ] Google Play Console: Formular/Nachweis für Hintergrund-Standortzugriff ("Prominent Disclosure") einreichen, inkl. Demo-Video
- [x] Store-Listing-Texte geschrieben ([docs/play-store-listing.md](docs/play-store-listing.md)): Kurz- und Langbeschreibung, fertig zum Reinkopieren
- [x] Store-Listing-Texte in Play Console eingetragen, Content-Rating-Fragebogen ausgefüllt, App-Symbol (512x512) und Vorstellungsgrafik (1024x500) erstellt und hochgeladen, Screenshots hochgeladen
- [x] Store-Screenshots fürs Play-Store-Format angepasst (Original-Screenshots hatten 2.23:1, Play Store erlaubt max. 2:1) - fertige Versionen liegen unter [screenshots/playstore/](screenshots/playstore/)
- [ ] Version auf 1.0.0 anheben (app.json + package.json), sobald alles andere steht

## Qualitätssicherung

- [ ] Testen auf weiteren Android-Herstellern (Samsung, Xiaomi) - Motorola wurde bereits mehrfach über mehrere Stunden getestet, andere Hersteller drosseln Hintergrund-Apps teils stärker
- [ ] iOS-Build und -Test (bisher nur Android getestet)

## Später / optional

- [ ] Umstieg von Cloudflare-Relay auf eigenen EU-Server (z.B. Hetzner, Docker neben bestehender Nextcloud) für den Live-Standort-Link
- [ ] Ggf. Umstieg von `expo-location`/`expo-task-manager` auf `react-native-background-geolocation` (kostenpflichtig), falls die gelegentlichen Tracking-Lücken (bis zu ~17 Min. bei längerem Stillstand beobachtet) im echten Einsatz zu einem Problem werden
