# TODO

Offene Aufgaben und Ideen für NaturlustTrailGuide. Wird laufend ergänzt.

## Play-Store-Veröffentlichung

- [x] Echten Release-Keystore erzeugen und Signierung umstellen (statt Debug-Keystore)
- [x] Datenschutzerklärung schreiben ([PRIVACY.md](PRIVACY.md)/[PRIVACY.en.md](PRIVACY.en.md))
- [x] Datenschutzerklärung unter fester URL veröffentlicht: https://naturlust.net/trailguide-app-datenschutz/
- [ ] Google Play Console: App anlegen, Data-Safety-Formular ausfüllen (Ausfüllhilfe: [docs/play-store-data-safety.md](docs/play-store-data-safety.md))
- [ ] Google Play Console: Formular/Nachweis für Hintergrund-Standortzugriff ("Prominent Disclosure") einreichen, inkl. Demo-Video
- [x] Store-Listing-Texte geschrieben ([docs/play-store-listing.md](docs/play-store-listing.md)): Kurz- und Langbeschreibung, fertig zum Reinkopieren
- [ ] Store-Listing-Texte in Play Console eintragen, Content-Rating-Fragebogen ausfüllen
- [ ] Store-Screenshots im korrekten Format prüfen/anpassen (Play Store verlangt bestimmte Seitenverhältnisse)
- [ ] Version auf 1.0.0 anheben (app.json + package.json), sobald alles andere steht

## Qualitätssicherung

- [ ] Testen auf weiteren Android-Herstellern (Samsung, Xiaomi) - Motorola wurde bereits mehrfach über mehrere Stunden getestet, andere Hersteller drosseln Hintergrund-Apps teils stärker
- [ ] iOS-Build und -Test (bisher nur Android getestet)

## Später / optional

- [ ] Umstieg von Cloudflare-Relay auf eigenen EU-Server (z.B. Hetzner, Docker neben bestehender Nextcloud) für den Live-Standort-Link
- [ ] Ggf. Umstieg von `expo-location`/`expo-task-manager` auf `react-native-background-geolocation` (kostenpflichtig), falls die gelegentlichen Tracking-Lücken (bis zu ~17 Min. bei längerem Stillstand beobachtet) im echten Einsatz zu einem Problem werden
