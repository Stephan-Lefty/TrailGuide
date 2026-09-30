[Deutsch](PRIVACY.md) | [English](PRIVACY.en.md)

# Privacy Policy – NaturlustTrailGuide

This policy applies to the "NaturlustTrailGuide" (NTG) app.

## What data is processed

- **Location data** (GPS coordinates, accuracy, timestamp): only recorded during an activity you actively started, including in the background with the screen locked.
- **Emergency contacts** (name, phone number): entered by you or picked from your address book. Up to two permanent contacts plus an optional contact just for the current activity.
- **Live location link** (only when you actively tap "Start live tracking"): a random, unguessable access token plus your current location while sharing is active.

## Where this data is stored and sent

- **Locally on your device**: All location data, activities, and emergency contacts are stored exclusively on-device (SQLite database). There is no developer-operated server that this data is automatically sent to.
- **Automatic deletion**: If you end an activity normally ("Everything is fine"), all recorded location data for that activity is deleted immediately and permanently. Only if you deliberately choose "There was an incident" is it kept.
- **Emergency call (112 & country-specific numbers)**: The call runs through your device's regular phone function, exactly like a manually dialed call. No data is sent to any app server in the process.
- **Live location link**: Only when you actively start this feature, your location is sent to a Cloudflare Worker relay (Cloudflare Workers KV) so the person with the link can see it. Cloudflare is a US-based company; data is stored with an automatic expiry and can be deleted immediately at any time via "End sharing". This is currently a technical testing solution; a move to a self-hosted, EU-based server is planned.
- **GPX export**: If you export an activity as a GPX file (by mail or via the share sheet), the file only leaves your device once you actively trigger the send/share action and choose a recipient.
- **No cloud backup by Android**: Android normally backs up installed apps' data to the user's Google account automatically and restores it on reinstallation. For this app that is explicitly switched off as of version 1.0.2 (`allowBackup="false"`). Location traces and emergency contacts therefore do not leave your device by this route either. The flip side: after switching devices or reinstalling, your emergency contacts are gone and have to be entered again — this is a deliberate choice.
- **No analytics/tracking services**: The app contains no analytics, advertising, or third-party tracking SDKs.

## Permissions

- **Location (including background)**: Core feature of the app - recording during an active outing.
- **Contacts**: Only for the native contact-picker dialog when you tap "Pick from contacts". There is no automatic or full access to your address book.
- **Phone**: So the emergency call button can actually place a call.
- **Internet**: Only for the optional live location link feature.

## Control over your data

- Under "My activities" you can delete retained activity data individually or all at once, at any time.
- Under "Reset app to factory state" (Settings) all locally stored data (contacts, activities, settings) is deleted at once.
- An active live location share can be ended immediately at any time.

## Contact

Questions or concerns about privacy: **info@naturlust.net** or via the contact form at [naturlust.net/trailguide-app](https://naturlust.net/trailguide-app/).
