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
- **Low-battery warning**: If the battery drops below 15% during an active activity, the app alerts you with sound.
- **Connection-restored alert**: After a connection loss, an alert with sound lets you know as soon as signal is back.
- **Restart reminder**: If the device restarted while an activity was still running, a notification reminds you to reopen the app to resume tracking.
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

### 1.0.2
Triggered by the second comparison measurement: a bike ride with a Garmin watch running in parallel and a second bike recording as well (29.09.2026). The accuracy filter from 1.0.1 held up — the deviation dropped from 129% to 2.3%. A closer look then showed that those 2.3% are deceptive: they are the sum of two errors that almost cancel each other out.
- **Locations are now captured every 10 seconds instead of every 30.** Thinning the reference track down to the previous interval costs it 7.2% of its length: at cycling speed, more than 150 metres lie between two measurements, and every curve in between becomes a straight line. At 10 seconds the loss is only 2.8%. The 5.3% of noise had been masking that loss, which made the total distance look almost right.
- **Plausibility check for locations.** The accuracy filter only helps when the device admits its own uncertainty — and it does not always do so. On this ride, jumps of 470 to 834 metres got through, reported with unremarkable accuracy; the largest would mean 163 km/h on a bicycle. Such mislocations can only be spotted from the movement, not from the reported quality. A location that would require more than 90 km/h to reach from the last good one is now discarded. More important than the distance figure is the emergency case: those jumps also went out to the live location link, showing a follower a position several hundred metres off the route.
- **Elevation is now recorded.** The app previously stored no altitude at all, even though Android supplies it — not one of the 215 points exported from the bike ride carried an elevation, while the reference reported +400/−380 m. For a mountain-sports app that was a real gap. Because GPS-measured altitude fluctuates more than position does, only changes above 10 metres count as genuine ascent; without that threshold, even a ride across flat ground would add up to a three-digit figure.
- **Distance and elevation in "My activities".** That list previously showed only the duration and the number of GPS points — a technical figure that says nothing about the tour.
- **Accuracy is now included in the GPX export.** While evaluating the bike ride it was impossible to determine what accuracy the remaining outliers had reported: the value was in the database but missing from the exported file.

### 1.0.1
Triggered by comparing a real hike against a Garmin watch running in parallel (27.09.2026):
- **Accuracy filter for location data.** In the background, Android throttles GPS and regularly falls back to cell-tower or Wi-Fi positioning. Unfiltered, those estimates produced jumps of several hundred metres: the comparison recorded 21.95 km instead of the 9.59 km actually walked, about a third of it from 19 individual outliers. Worse than the wrong distance was the consequence for an emergency — a shared location could be several hundred metres off. Points reported as worse than 50 m are now discarded. If reception stays poor for more than five minutes, a rough point is recorded anyway: an imprecise location beats a gap when it matters.
- **Only one activity can be active at a time.** The app used to create the database entry *before* asking for location permission. Because Android opens a separate system page for that and suspends the app in the process, users ended up back on the start screen and tapped again — leaving two active activities. The older one became invisible, all further GPS points went into the newer one, and the first hike appeared to break off mid-run. A unique index in the database now makes this impossible.
- **Two-step start screen.** If permission is missing, step 1 explains why and offers only "Allow location access" — without creating an activity yet. On returning from the system settings the screen switches to step 2 by itself and explicitly says that one more tap is needed.
- **The live location link states the accuracy.** Anyone following the link previously saw only a pin and had to assume it was exact. It now says whether the location is precise or merely an area — so a rescuer knows whether they are looking at a point or a search radius. The age of the reading is shown in minutes rather than seconds and is highlighted clearly after ten minutes.
- Fix: The state is now re-read from the database when the app returns from the background. Previously the start screen could show "Start activity" even though one was already running.
- Fix: If stopping location recording fails, the activity is still ended cleanly. Previously it stayed active indefinitely in that case.

### 1.0.0
First public version, prompted by the conversation with the Austrian Alpine Club (mountain sports department):
- Low-battery warning during an active activity once the battery drops below 15% (with sound).
- Connection-restored alert with sound as soon as signal comes back after a connection loss.
- Reminder after a device restart if an activity was still running — the app must be reopened manually afterward to resume tracking (deliberately no automatic background restart, to avoid an additional, sensitive permission).
- Bug fix: if the app found an already-running activity on launch (e.g. after a device restart), location tracking itself was not resumed automatically.

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

## Privacy

See [PRIVACY.en.md](PRIVACY.en.md) for the privacy policy.

## License

[MIT](LICENSE) – Stephan Rösner ([Naturlust.net](https://naturlust.net))
