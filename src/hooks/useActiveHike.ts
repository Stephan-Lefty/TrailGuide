import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { startBatteryMonitoring, stopBatteryMonitoring } from '../services/battery/batteryWarningService';
import { startConnectivityMonitoring, stopConnectivityMonitoring } from '../services/connectivity/connectivityWarningService';
import { clearTourContact } from '../services/contacts/contactsRepository';
import { createHike, deleteHike, getActiveHike, updateHikeStatus } from '../services/hike/hikeRepository';
import { deleteTrackPoints } from '../services/hike/trackPointsRepository';
import {
  isBackgroundLocationTaskRunning,
  requestLocationPermissions,
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
  type StartTrackingResult,
} from '../services/location/backgroundLocationService';
import { stopLiveShare } from '../services/sharing/shareLinkService';
import type { Hike } from '../types/hike';

export function useActiveHike() {
  const [hike, setHike] = useState<Hike | null>(null);
  /**
   * Ob zur aktiven Aktivitaet tatsaechlich Standort-Updates laufen.
   * null = keine Aktivitaet oder noch nicht geprueft.
   */
  const [trackingActive, setTrackingActive] = useState<boolean | null>(null);

  const refresh = useCallback(() => {
    setHike(getActiveHike());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Deckt den Fall ab, dass beim Start der App (oder beim Oeffnen eines
   * weiteren Screens) bereits eine Aktivitaet laeuft, die nicht ueber
   * startHike() in dieser Sitzung gestartet wurde - z.B. nach einem
   * Geraete-Neustart oder wenn der App-Prozess vom Betriebssystem im
   * Hintergrund beendet und neu gestartet wurde. Das Standort-Tracking wird
   * dabei mit-fortgesetzt, falls es (z.B. durch einen Prozess-Neustart)
   * nicht mehr laeuft - sonst haette die App weder einen aktiven
   * Vordergrund-Dienst noch wuerden Akku-/Netz-Ueberwachung zuverlaessig im
   * Hintergrund weiterlaufen.
   */
  useEffect(() => {
    if (!hike) {
      setTrackingActive(null);
      return;
    }
    void (async () => {
      let alreadyTracking = await isBackgroundLocationTaskRunning();
      if (!alreadyTracking) {
        const result = await startBackgroundLocationTracking();
        alreadyTracking = result.success;
      }
      // Scheitert die Wiederaufnahme, laeuft eine Aktivitaet ohne Aufzeichnung
      // weiter. Anders als beim Start laesst sie sich hier nicht einfach
      // verwerfen - sie kann bereits echte Punkte enthalten. Stattdessen wird
      // der Zustand nach oben gereicht, damit der Startbildschirm warnen kann.
      setTrackingActive(alreadyTracking);
      void startBatteryMonitoring();
      void startConnectivityMonitoring();
    })();
  }, [hike?.id]);

  /**
   * Holt den Zustand aus der Datenbank, sobald die App aus dem Hintergrund
   * zurueckkehrt. Ohne das kann die Anzeige auseinanderlaufen: der Bildschirm
   * liest sonst nur beim Aufbauen einmal aus SQLite und zeigt danach
   * womoeglich "Aktivitaet starten", obwohl laengst eine laeuft.
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  /**
   * Die Berechtigung wird ZUERST eingeholt - erst danach entsteht ein
   * Datenbankeintrag. Andersherum (so war es bis 1.0.0) legte createHike() die
   * Aktivitaet an, dann oeffnete Android die Berechtigungsseite und raeumte
   * dabei die App ab; der Nutzer landete wieder auf dem Start-Bildschirm und
   * tippte erneut - und hatte zwei aktive Aktivitaeten.
   */
  const startHike = useCallback(async (): Promise<{ hike: Hike | null; tracking: StartTrackingResult }> => {
    const permissions = await requestLocationPermissions();
    if (!permissions.success) {
      return { hike: null, tracking: permissions };
    }
    const created = createHike();
    setHike(created); // loest den Aktivitaets-Effekt oben aus (Akku-/Netz-Ueberwachung)

    // Startet das Tracking nicht, darf die Aktivitaet nicht bestehen bleiben.
    // Sonst zeigt die App "Aktivitaet aktiv seit ...", waehrend in Wirklichkeit
    // nichts aufgezeichnet wird - der gefaehrlichste denkbare Zustand fuer eine
    // Notfall-App, schlimmer als ein Start, der sichtbar scheitert. Genau so
    // eine Leiche tauchte am 30.09.2026 in der Datenbank auf: ein Eintrag auf
    // "aktiv", zu dem im Batterieprotokoll des Geraets nie ein Vordergrund-
    // dienst lief.
    let tracking: StartTrackingResult;
    try {
      tracking = await startBackgroundLocationTracking();
    } catch {
      tracking = { success: false, reason: 'start_failed' };
    }
    if (!tracking.success) {
      deleteHike(created.id);
      setHike(null);
      return { hike: null, tracking };
    }

    return { hike: created, tracking };
  }, []);

  /**
   * Beendet die aktive Wanderung. Der Tour-Kontakt (4. Kontakt) wird dabei
   * immer entfernt - unabhaengig davon, ob ein Vorfall vorlag oder nicht.
   * Ohne Vorfall werden zusaetzlich alle aufgezeichneten Standortpunkte
   * geloescht (Kernregel: keine dauerhafte Speicherung normaler Touren).
   */
  const endHike = useCallback(
    async (hadIncident: boolean) => {
      if (!hike) return;
      // Ein Fehler beim Stoppen darf das Beenden nicht verhindern. Stand diese
      // Zeile ungeschuetzt am Anfang, blieb die Aktivitaet bei jedem Problem
      // dauerhaft auf "aktiv" - mit der Folge, dass spaetere GPS-Punkte in eine
      // neue Aktivitaet wanderten und die alte unsichtbar liegenblieb.
      try {
        await stopBackgroundLocationTracking();
      } catch {
        // Bewusst geschluckt: Der Status wird unten in jedem Fall gesetzt.
      }

      // Der Live-Link muss mit der Aktivitaet enden.
      //
      // Bis 1.0.4 geschah das nicht: Der Token blieb bis zum Ablauf seiner
      // festen Laufzeit auf dem Relay erreichbar - standardmaessig sechs
      // Stunden - und zeigte weiter die zuletzt uebertragene Position. Noch
      // unangenehmer war die Folge daraus: Weil der Token an der Aktivitaet
      // haengt, fand die App ihn nach dem Beenden nicht mehr. Der Nutzer hatte
      // damit keinen Weg mehr, seinen eigenen Link loszuwerden.
      //
      // Fuer eine App, die zusagt, nach einer normalen Tour bleibe nichts
      // zurueck, war das derselbe Widerspruch wie seinerzeit das
      // Android-Cloud-Backup. Gefunden am 04.10.2026, als Stephan nach einer
      // Radtour fragte, ob sein Standort noch geteilt werde.
      //
      // Absichtlich aus der Datenbank gelesen statt aus dem State: Der Link
      // kann in einem anderen Screen gestartet worden sein, ohne dass dieser
      // Hook seitdem aktualisiert hat.
      const aktuell = getActiveHike();
      const token = aktuell?.id === hike.id ? aktuell.shareToken : hike.shareToken;
      if (token) {
        // Ohne await: stopLiveShare vergisst den Link sofort lokal und schickt
        // den Widerruf nebenher los. Am Ende einer Bergtour ohne Netz
        // dazustehen ist der Normalfall, und daran darf das Beenden einer
        // Aktivitaet nicht haengenbleiben. Die feste Ablaufzeit des Tokens ist
        // die Rueckfallebene, falls der Widerruf nicht ankommt.
        void stopLiveShare(hike.id, token);
      }

      stopBatteryMonitoring();
      stopConnectivityMonitoring();
      updateHikeStatus(hike.id, hadIncident ? 'ended_incident' : 'ended_normal', Date.now());
      if (!hadIncident) {
        deleteTrackPoints(hike.id);
      }
      await clearTourContact(hike.id);
      setHike(null);
    },
    [hike],
  );

  return { hike, trackingActive, startHike, endHike, refresh };
}
