import { useCallback, useEffect, useState } from 'react';

import { clearTourContact } from '../services/contacts/contactsRepository';
import { createHike, getActiveHike, updateHikeStatus } from '../services/hike/hikeRepository';
import { deleteTrackPoints } from '../services/hike/trackPointsRepository';
import {
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

  const startHike = useCallback(async (): Promise<{ hike: Hike; tracking: StartTrackingResult }> => {
    const created = createHike();
    setHike(created);
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
