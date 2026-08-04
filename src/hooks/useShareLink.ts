import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

import { pushTrackLocation } from '../services/sharing/relayApiClient';
import { startLiveShare, stopLiveShare } from '../services/sharing/shareLinkService';
import type { Hike } from '../types/hike';

export type ShareLinkStatus = 'idle' | 'creating' | 'active' | 'error';

interface UseShareLinkResult {
  status: ShareLinkStatus;
  viewUrl: string | null;
  expiresAt: number | null;
  start: (ttlMinutes?: number) => Promise<string | null>;
  stop: () => Promise<void>;
}

const DEFAULT_TTL_MINUTES = 360;

/**
 * Verwaltet den Live-Standort-Link fuer die aktive Wanderung. Der Token wird
 * bewusst in einem eigenen State gehalten (nicht nur ueber das von aussen
 * hereingereichte `hike`-Objekt gelesen) - `hike` wird nach dem Start des
 * Links sonst nicht automatisch neu geladen und waere beim Beenden veraltet.
 */
export function useShareLink(hike: Hike | null): UseShareLinkResult {
  const [status, setStatus] = useState<ShareLinkStatus>(
    hike?.shareToken && (hike.shareExpiresAt ?? 0) > Date.now() ? 'active' : 'idle',
  );
  const [token, setToken] = useState<string | null>(hike?.shareToken ?? null);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(hike?.shareExpiresAt ?? null);

  const start = useCallback(
    async (ttlMinutes: number = DEFAULT_TTL_MINUTES): Promise<string | null> => {
      if (!hike) return null;
      setStatus('creating');
      try {
        const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
        if (permStatus !== 'granted') {
          setStatus('error');
          return null;
        }

        const share = await startLiveShare(hike.id, ttlMinutes);
        setToken(share.token);
        setViewUrl(share.viewUrl);
        setExpiresAt(share.expiresAt);
        setStatus('active');

        // Sofortiger erster Push, damit der Link direkt beim Oeffnen schon einen
        // Standort zeigt statt "noch kein Standort empfangen" abzuwarten.
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        await pushTrackLocation(share.token, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });

        return share.viewUrl;
      } catch {
        setStatus('error');
        return null;
      }
    },
    [hike],
  );

  const stop = useCallback(async () => {
    if (!hike || !token) return;
    await stopLiveShare(hike.id, token);
    setToken(null);
    setViewUrl(null);
    setExpiresAt(null);
    setStatus('idle');
  }, [hike, token]);

  return { status, viewUrl, expiresAt, start, stop };
}
