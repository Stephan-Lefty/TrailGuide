import { useCallback, useEffect, useState } from 'react';

import { startBatteryMonitoring, stopBatteryMonitoring } from '../services/battery/batteryWarningService';
import { startConnectivityMonitoring, stopConnectivityMonitoring } from '../services/connectivity/connectivityWarningService';
import { clearTourContact } from '../services/contacts/contactsRepository';
import { createHike, getActiveHike, updateHikeStatus } from '../services/hike/hikeRepository';
import { deleteTrackPoints } from '../services/hike/trackPointsRepository';
import {
  isBackgroundLocationTaskRunning,
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
  type StartTrackingResult,
} from '../services/location/backgroundLocationService';
import type { Hike } from '../types/hike';

export function useActiveHike() {
  const [hike, setHike] = useState<Hike | null>(null);

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
    if (!hike) return;
    void (async () => {
      const alreadyTracking = await isBackgroundLocationTaskRunning();
      if (!alreadyTracking) {
        await startBackgroundLocationTracking();
      }
      void startBatteryMonitoring();
      void startConnectivityMonitoring();
    })();
  }, [hike?.id]);

  const startHike = useCallback(async (): Promise<{ hike: Hike; tracking: StartTrackingResult }> => {
    const created = createHike();
    setHike(created); // loest den Aktivitaets-Effekt unten aus (Akku-/Netz-Ueberwachung)
    const tracking = await startBackgroundLocationTracking();
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
      await stopBackgroundLocationTracking();
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

  return { hike, startHike, endHike, refresh };
}
