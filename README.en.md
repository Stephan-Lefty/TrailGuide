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

### 1.0.5
A question from Stephan after the bike tour of 04.10.2026 — "could it be that my live location is still being shared?" — uncovered a whole chain of defects around the live location link. All four concerned the same promise: that a share ends when you end it.
- **The live link survived ending the activity.** Recording stopped, the track points were deleted, the tour contact was removed — only the link stayed on the server until its lifetime ran out: six hours by default. It kept showing the last transmitted position. For an app that promises nothing is left behind after a normal tour, that was the same contradiction as the Android cloud backup once was.
- **The stop button was ineffective in the normal case** — the more serious of the two. If you had left the SOS area in between, or restarted the app, it showed no active link at all. So you did not even know there was something to switch off, and the button for it was gone.
- **Starting could hang indefinitely.** During testing on a mobile network where IPv6 was unreachable, the first server call took **five minutes**. The button showed "starting…" the whole time, with no feedback and no way to cancel. The attempt now fails after 20 seconds and the button becomes usable again. Stopping no longer waits for the network at all: the app forgets the link immediately and sends the revocation alongside.
- **The first failed attempt was silent.** The message "live tracking unavailable" only appeared from the second attempt onwards — on the first, where an explanation matters most, the button simply sprang back without comment.

The last two were only found by walking through the flow on a real device. The tests before that were green and covered the logic; what they could not cover was a mobile network on which the server does not answer for minutes.

### 1.0.4
Triggered by the fourth comparison measurement: a six-hour mountain tour with a Garmin watch running in parallel (03.10.2026) — at last one with real elevation gain. Distance was the best result so far at **−2.6 %**, and the three shared locations landed 1.6 / 10.0 / 11.3 metres from the reference. Elevation gain has more than halved compared to 1.0.2 but is still wrong: +311 instead of +244 metres.
- **Vertical accuracy is now recorded.** It goes into the database and the GPX export but is not yet evaluated. The reason for that restraint is in the measurement data: three times the reported altitude jumped by 127 to 136 metres within a minute while the position moved less than one metre and the device reported a *horizontal* accuracy of 2 to 5 metres. Those jumps account for most of the remaining error, and the horizontal figure cannot find them. Android supplies a separate uncertainty for altitude — until now we threw it away.
- **The smoothing parameters were deliberately left alone.** The obvious reaction would be to adjust window and threshold until 311 drops to 244. Working it through gives: 120 s/30 m → +311, 120 s/40 m → +320, 180 s/30 m → +287, 180 s/40 m → +320. That is not monotonic — tightening the setting sometimes helps and sometimes hurts. Differences like that are noise, not signal, and picking the best pair would fit the app to a single tour. Measure first, then decide.
- **The live link now reports standstill.** Someone who does not move triggers no new location fix — during the three-hour rest on this tour Android delivered a point only every 60 to 630 seconds. The follower then saw "updated 10 minutes ago" and could not tell two completely different situations apart: someone is taking a break, or the phone is dead. For an emergency app that is the wrong ambiguity, because anyone waiting for rescue is by definition not moving. If someone stays within a 25-metre radius for more than five minutes, the page now states: **"Person is not moving. Position unchanged since 13:28 (for 2 hrs 18 min)."** The radius was checked against the real tour — at 15 metres the rest breaks into fragments, at 40 metres the tour's inaccurate first point pulls everything together.
- **Transmission to the live link happens once per measurement cycle instead of once per point.** Android often delivers buffered locations in batches; until now a slow network request in the middle of such a batch could hold up the recording of the remaining points. The freshest position of the batch is now the one transmitted.

### 1.0.3
Triggered by the third comparison measurement: a two-hour hike with a Garmin watch running in parallel (30.09.2026) — the first measurement with meaningful elevation data. At −1.3% against the reference the distance looked fine; the elevation figure did not. The app reported +496 metres of ascent for a tour that actually gained about 30.
- **Elevation gain was sixteen times too high.** The 10-metre threshold from 1.0.2 was borrowed from barometric altimeter practice and is far too low for GPS. The measured altitude error of the phone had a standard deviation of 11.5 metres with excursions from −39 to +32 metres — jitter of that size passes a 10-metre threshold unhindered. The threshold is now 30 metres.
- **A threshold alone was not enough.** The altitude error is not random jitter but a slow drift: from one point to the next its autocorrelation was 0.74, meaning the value stays skewed in the same direction for half a minute at a time. To a threshold, a slow 25-metre shift looks exactly like a real climb. Altitudes are therefore smoothed over two minutes before being summed. The same tour now yields **+32/−40 m** instead of +496/−496 m — the reference states +30/−40 m.
- **The accuracy filter is stricter while recording** (30 instead of 50 metres). Of 385 points exactly one was bad — reported at 47.4 metres and thus just under the old limit. That single point sat so far off that the way to it and back added up to 255 metres: 83% of the entire distance error of the tour. Sharing a single location still allows up to 50 metres, because there is no alternative there — whatever is available gets shared, the caller is waiting now. A track point, by contrast, has hundreds of siblings and the next one arrives in ten seconds. If reception stays poor for longer, the five-minute rule still applies: the track gets thinner, it does not break off.

What did **not** go wrong in this measurement is recorded just as carefully: the four locations shared during the tour were 3.6 / 6.6 / 7.9 and 30.8 metres away from the reference — three of them closer to the truth than the Garmin watch itself. That is the figure that matters in an emergency. Battery consumption was 7.1% per hour (65% down to 51% over 1 hour 58 minutes, with the display off for 94% of that time). The ten-second interval introduced in 1.0.2 therefore costs roughly one percentage point per hour compared to the earlier thirty-second interval — the satellite receiver runs continuously anyway, so polling it more often changes little.

### 1.0.2
Triggered by the second comparison measurement: a bike ride with a Garmin watch running in parallel and a second bike recording as well (29.09.2026). The accuracy filter from 1.0.1 held up — the deviation dropped from 129% to 2.3%. A closer look then showed that those 2.3% are deceptive: they are the sum of two errors that almost cancel each other out.
- **Locations are now captured every 10 seconds instead of every 30.** Thinning the reference track down to the previous interval costs it 7.2% of its length: at cycling speed, more than 150 metres lie between two measurements, and every curve in between becomes a straight line. At 10 seconds the loss is only 2.8%. The 5.3% of noise had been masking that loss, which made the total distance look almost right.
- **Plausibility check for locations.** The accuracy filter only helps when the device admits its own uncertainty — and it does not always do so. On this ride, jumps of 470 to 834 metres got through, reported with unremarkable accuracy; the largest would mean 163 km/h on a bicycle. Such mislocations can only be spotted from the movement, not from the reported quality. A location that would require more than 90 km/h to reach from the last good one is now discarded. More important than the distance figure is the emergency case: those jumps also went out to the live location link, showing a follower a position several hundred metres off the route.
- **Elevation is now recorded.** The app previously stored no altitude at all, even though Android supplies it — not one of the 215 points exported from the bike ride carried an elevation, while the reference reported +400/−380 m. For a mountain-sports app that was a real gap. Because GPS-measured altitude fluctuates more than position does, only changes above 10 metres count as genuine ascent; without that threshold, even a ride across flat ground would add up to a three-digit figure.
- **Distance and elevation in "My activities".** That list previously showed only the duration and the number of GPS points — a technical figure that says nothing about the tour.
- **The live location link is transmitted more sparingly.** Points are recorded every ten seconds but still sent at most every thirty. Sending each one would have tripled the number of network calls, and the radio costs more power than the GPS receiver, which runs continuously anyway. Measured consumption was around 6% of battery per hour — on a full-day tour that is the difference between making it home and not. Nothing changes for followers: the link was only ever accurate to half a minute, and the first point after sharing still goes out immediately.
- **Android no longer backs the app's data up to the cloud.** While testing the points above, a freshly installed app immediately showed a running activity and the old emergency contacts again: Android backs app data up to the user's Google account by default and restores it on reinstallation. For an app whose privacy policy promises "stored exclusively locally on your device", that is a contradiction — location traces and phone numbers were sitting in a cloud backup. `allowBackup` is now switched off. The downside is accepted deliberately: after switching devices, emergency contacts have to be entered again.
- **Adjustments for newer Android versions.** The app now keeps the bottom edge of the screen clear: since Android 15 apps draw underneath the system bars by default, which could hide the SOS button behind the navigation bar. The fixed portrait orientation has also been lifted — Android 16 ignores such restrictions on large displays regardless.
- **The one-off shared location message now states the accuracy** — and waits briefly for a usable satellite fix instead of taking the first location Android hands over (which is often the last known one or a cell-tower estimate). The message previously contained only coordinates and a maps link: whoever received it could not tell a location accurate to 5 m from one that was 300 m off, and saw only a pin in both cases. It now either says "accurate to about 12 m" or carries a clear warning with the possible radius. The wait is capped at twelve seconds and ends as soon as the fix is good — in an emergency the message must not be held up by a waiting period.
- **Accuracy is now included in the GPX export.** While evaluating the bike ride it was impossible to determine what accuracy the remaining outliers had reported: the value was in the database but missing from the exported file.

  Background on recording while stationary: the evaluation showed that virtually all of this ride's noise arose within a single quarter of an hour — the time spent standing still. Standing still is not the problem in itself; the reference track scatters by less than three metres during its stationary phases. The problem is that a device does not always admit losing its satellite fix: for more than four minutes the recorded position sat 50 to 245 metres off, with unremarkable reported accuracy. For a safety app this is the most important case of all, because an injured person does not move. Averaging several measurements demonstrably does not help — against a systematic offset, every measurement is wrong in the same direction. The only sound approach is to state the uncertainty openly instead of feigning precision.

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
