# Google Play Console: Data-Safety-Formular – Ausfüllhilfe

Referenz zum manuellen Ausfüllen des "Data Safety"-Formulars in der Play Console
(Store-Präsenz → Inhaltsangaben → Datensicherheit). Basiert auf dem tatsächlichen
Datenverhalten der App, siehe auch [PRIVACY.md](../PRIVACY.md).

## Grundfragen

- **Sammelt oder gibt die App Nutzerdaten weiter?** Ja (Standort, Kontaktdaten)
- **Werden alle Nutzerdaten verschlüsselt übertragen?** Ja (HTTPS zum
  Cloudflare-Relay; lokale SQLite-Daten verlassen das Gerät nicht, außer der
  Nutzer exportiert/teilt sie aktiv selbst)
- **Bietet die App eine Möglichkeit, die Löschung von Nutzerdaten zu
  beantragen?** Ja - automatische Löschung bei normalem Tourende, außerdem
  manuell über "Meine Aktivitäten" und "App in Werkszustand zurücksetzen"

## Datentyp: Standort

| Feld | Wert |
|---|---|
| Ungefährer Standort | Erfasst |
| Genauer Standort | Erfasst |
| Weitergabe an Dritte | Nein* |
| Zweck | App-Funktionalität |
| Pflicht oder optional | Pflicht (Kernfunktion der App) |
| Nutzer kann Löschung beantragen | Ja |
| Verschlüsselt übertragen | Ja |

*\*Hinweis zur Live-Standort-Freigabe:* Bei aktiver Live-Standort-Freigabe wird
der Standort an Cloudflare (Workers KV) übertragen, aber ausschließlich als
technischer Dienstleister zur Bereitstellung dieser einen Funktion, nicht zu
Cloudflares eigenen Zwecken. Nach Googles Definition zählt das in der Regel
**nicht** als "Weitergabe" (das wäre nur der Fall, wenn ein Dritter die Daten
für eigene Zwecke nutzen dürfte). Bitte beim Ausfüllen die aktuelle
Google-Hilfeseite zu "Service provider vs. third party" gegenlesen, falls
unsicher - das ist die einzige Stelle in diesem Formular, die eine echte
Ermessensfrage ist.

## Datentyp: Persönliche Daten

| Feld | Wert |
|---|---|
| Name | Erfasst (Name der Notfallkontakte) |
| Telefonnummer | Erfasst (Nummer der Notfallkontakte) |
| Weitergabe an Dritte | Nein |
| Zweck | App-Funktionalität |
| Pflicht oder optional | Mindestens ein Kontakt ist bei der Ersteinrichtung Pflicht |
| Nutzer kann Löschung beantragen | Ja |
| Verschlüsselt übertragen | Nicht zutreffend (verlässt das Gerät nicht) |

## Datentyp: Kontakte

Die App nutzt den nativen Kontakt-Auswahl-Dialog (`expo-contacts`), wenn der
Nutzer "Kontakt auswählen" antippt - dafür ist technisch die
READ_CONTACTS-Berechtigung nötig, auch wenn nur ein einzelner ausgewählter
Kontakt gelesen wird (kein Massenzugriff/-import).

| Feld | Wert |
|---|---|
| Kontakte | Erfasst |
| Weitergabe an Dritte | Nein |
| Zweck | App-Funktionalität |
| Pflicht oder optional | Optional (manuelle Eingabe ist immer möglich) |
| Nutzer kann Löschung beantragen | Ja |

## Alle anderen Datentypen

**Nicht erfasst** - die App enthält kein Analytics-, Crash-Reporting- oder
Werbe-SDK, keine Nutzerkonten, keine Finanz-, Gesundheits-, Nachrichten-,
Foto-/Video-/Audio-, Datei-, Kalender- oder Web-Browsing-Daten, keine
Geräte-/Werbe-IDs:

- Finanzdaten
- Gesundheit und Fitness
- Nachrichten
- Fotos und Videos
- Audiodateien
- Dateien und Dokumente
- Kalender
- App-Aktivitäten
- Web-Browsing
- App-Infos und Leistung
- Geräte- oder andere IDs

## Sicherheitspraktiken (eigener Abschnitt im Formular)

- **Daten werden während der Übertragung verschlüsselt**: Ja
- **Nutzer können die Löschung ihrer Daten beantragen**: Ja
- **Unabhängige Sicherheitsüberprüfung durchlaufen**: Nein (Privatprojekt,
  keine formale externe Prüfung)
- **Einhaltung der Google Play Families-Richtlinie**: Nicht zutreffend - App
  richtet sich nicht gezielt an Kinder

## Nach dem Ausfüllen

Datenschutzerklärung-URL im Formular eintragen:
**https://naturlust.net/trailguide-app-datenschutz/**
