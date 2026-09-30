[Deutsch](PRIVACY.md) | [English](PRIVACY.en.md)

# Datenschutzerklärung – NaturlustTrailGuide

Diese Erklärung gilt für die App "NaturlustTrailGuide" (NTG).

## Welche Daten verarbeitet werden

- **Standortdaten** (GPS-Koordinaten, Genauigkeit, Zeitstempel): werden nur während einer von dir aktiv gestarteten Aktivität erfasst, auch im Hintergrund bei gesperrtem Display.
- **Notfallkontakte** (Name, Telefonnummer): trägst du selbst ein oder wählst sie aus deinem Adressbuch aus. Bis zu zwei dauerhafte Kontakte plus ein optionaler Kontakt nur für die aktuelle Aktivität.
- **Live-Standort-Link** (nur wenn du "Live-Tracking starten" aktiv antippst): ein zufälliger, nicht erratbarer Zugangs-Token plus dein aktueller Standort, solange die Freigabe läuft.

## Wo diese Daten gespeichert und hingeschickt werden

- **Lokal auf deinem Gerät**: Alle Standortdaten, Aktivitäten und Notfallkontakte werden ausschließlich lokal in der App gespeichert (SQLite-Datenbank). Es gibt keinen von den Entwicklern betriebenen Server, an den diese Daten automatisch übertragen werden.
- **Automatische Löschung**: Beendest du eine Aktivität normal ("Alles in Ordnung"), werden alle aufgezeichneten Standortdaten dieser Aktivität sofort und unwiderruflich gelöscht. Nur wenn du bewusst "Es gab einen Vorfall" wählst, bleiben sie erhalten.
- **Notruf (112 & länderspezifische Nummern)**: Der Anruf läuft über die normale Telefonfunktion deines Geräts, genau wie ein manuell gewählter Anruf. Es gibt dabei keine Übertragung an einen Server der App.
- **Live-Standort-Link**: Nur wenn du diese Funktion aktiv startest, wird dein Standort an einen Cloudflare-Worker-Relay (Cloudflare Workers KV) übertragen, damit die Person mit dem Link deinen Standort sehen kann. Cloudflare ist ein US-amerikanisches Unternehmen; die Daten werden zeitlich befristet gespeichert (automatisches Ablaufen) und lassen sich über den Button "Freigabe beenden" jederzeit sofort löschen. Dies ist aktuell eine technische Testlösung; eine Umstellung auf einen eigenen, EU-basierten Server ist geplant.
- **GPX-Export**: Exportierst du eine Aktivität als GPX-Datei (per Mail oder Teilen-Funktion), verlässt diese Datei dein Gerät erst, wenn du selbst den Versand-/Teilen-Vorgang auslöst und einen Empfänger auswählst.
- **Kein Cloud-Backup durch Android**: Android sichert die Daten installierter Apps normalerweise automatisch im Google-Konto des Nutzers und stellt sie bei einer Neuinstallation wieder her. Für diese App ist das seit Version 1.0.2 ausdrücklich abgeschaltet (`allowBackup="false"`). Standortspuren und Notfallkontakte verlassen dein Gerät dadurch auch auf diesem Weg nicht. Die Kehrseite: Bei einem Gerätewechsel oder einer Neuinstallation sind die Notfallkontakte weg und müssen neu eingetragen werden – das ist bewusst so gewählt.
- **Keine Analyse-/Tracking-Dienste**: Die App enthält keinerlei Analytics, Werbung oder Tracking-SDKs Dritter.

## Berechtigungen

- **Standort (auch im Hintergrund)**: Kernfunktion der App - Aufzeichnung während einer aktiven Tour.
- **Kontakte**: Nur für den nativen Kontakt-Auswahl-Dialog, wenn du "Kontakt auswählen" antippst. Es findet kein automatischer oder vollständiger Zugriff auf dein Adressbuch statt.
- **Telefon**: Um den Notruf-Button tatsächlich einen Anruf auslösen zu lassen.
- **Internet**: Nur für die optionale Live-Standort-Link-Funktion.

## Kontrolle über deine Daten

- Über "Meine Aktivitäten" kannst du erhaltene Aktivitätsdaten jederzeit einzeln oder komplett löschen.
- Über "App in Werkszustand zurücksetzen" (Einstellungen) werden alle lokal gespeicherten Daten (Kontakte, Aktivitäten, Einstellungen) auf einen Schlag gelöscht.
- Eine aktive Live-Standort-Freigabe kannst du jederzeit sofort beenden.

## Kontakt

Fragen oder Anliegen zum Datenschutz: **info@naturlust.net** oder über das Kontaktformular auf [naturlust.net/trailguide-app](https://naturlust.net/trailguide-app/).
