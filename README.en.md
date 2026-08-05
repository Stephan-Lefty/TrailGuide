[Deutsch](README.md) | [English](README.en.md) | [Changelog](#changelog) | [Important Note](#important-note)

# NaturlustTrailGuide (NTG)

**Your safety on the go. Your data stays yours.**

A safety app for hikers, mountaineers, and cyclists: location tracking only runs during an active outing, gets deleted immediately and permanently when it ends normally — and in an emergency, an emergency call, a key-questions checklist, emergency contacts, and location sharing are all one tap away.

More info, the full write-up, and a contact form: **[naturlust.net/trailguide-app](https://naturlust.net/trailguide-app/)**

---

## Core principle

Start an activity and the app records your location in the background — even with the screen locked. Get back safely, and one tap deletes all recorded location data immediately. No movement history accumulates over time. Only if something actually happened do you actively choose to keep the data.

## Features

- **Emergency call without detours**: 112 always available, plus an automatically detected, country-specific mountain rescue number (currently AT, CH, SK, PL, CZ, IT, ES, BG) — country detection works fully **offline**. In border regions the country can be overridden manually (Austria/Switzerland).
- **Hold gesture instead of a tap**: An emergency call only triggers after 5 seconds of deliberate holding — protects against accidental calls.
- **Key-questions checklist**: A collapsible reminder of the key information needed for an emergency call.
- **Emergency contacts**: Up to two permanent contacts (at least one required) plus an optional contact just for the current activity.
- **Share location**: A one-time location link, or a continuously updating live location link via a self-hosted relay server.
- **GPX export**: Recorded track points from incidents can be emailed as a GPX file or shared via any app.
- **SOS only after starting an activity**: The emergency access is locked until an activity is running — rules out accidental emergency calls.
- **Multilingual**: German/English, based on device language.

## Screenshots

| Initial setup | Active activity | SOS screen |
|---|---|---|
| ![Onboarding](screenshots/01_onboarding.png) | ![Home active](screenshots/05_home_aktiv.png) | ![SOS](screenshots/06_sos_oben.png) |

More annotated screenshots in the [`screenshots/`](screenshots/) folder and on the [project page](https://naturlust.net/trailguide-app/).

## Tech stack

- **App**: React Native / Expo (SDK 57), TypeScript, expo-router
- **Location tracking**: expo-location + expo-task-manager (background tracking)
- **Local data**: expo-sqlite (hikes, contacts, track points), react-native-mmkv (settings)
- **Country detection**: Natural Earth country boundaries (1:50m) + Turf.js, fully offline
- **Live location link**: Cloudflare Worker + Workers KV ([`server/`](server/))

## Development

```bash
npm install
cp .env.example .env   # adjust if needed
npm run android         # or: npm run ios / npm start
npm test
```

### Relay server (live location link)

```bash
cd server
npm install
cp wrangler.toml.example wrangler.toml
npx wrangler kv namespace create LOCATION_KV   # enter the id in wrangler.toml
npm run dev              # local development
npm run deploy           # deploy to Cloudflare
```

## Changelog

Refers to the app's version number (`app.json`/`package.json`).

### 0.1.0
Initial version:
- Background location tracking during an active activity, automatic deletion of all location data when an activity ends normally.
- SOS screen: 112 always available, automatic offline country detection with country-specific mountain rescue number (AT, CH, SK, PL, CZ, IT, ES, BG), manual country override for border regions (Austria/Switzerland).
- 5-second hold gesture for emergency calls, protects against accidental calls.
- Collapsible key-questions checklist for the emergency call.
- Permanent emergency contacts (max. 2, at least one required) plus an optional contact just for the current activity, can be picked directly from the address book.
- Share location as a one-time link or as a continuously updating live location link via a self-hosted Cloudflare Worker relay.
- "My activities": overview of all outings with retained data (after an incident), GPX export by mail or via the share sheet, delete individually or all at once.
- "App info" with contact details and a link to the project page.
- "Reset app to factory state" for a clean restart.
- German and English, based on device language.

## Important note

NaturlustTrailGuide is a private project and does not replace official emergency or rescue services. 112 remains the most reliable choice whenever in doubt. Use of the app is entirely at your own risk; no legal claims can be made against the creator arising from its use.

This app was built together with Claude.ai.

## License

[MIT](LICENSE) – Stephan Rösner ([Naturlust.net](https://naturlust.net))
