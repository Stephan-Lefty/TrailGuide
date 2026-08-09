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
