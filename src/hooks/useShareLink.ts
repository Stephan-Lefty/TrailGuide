import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import { buildViewUrl, pushTrackLocation } from '../services/sharing/relayApiClient';
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

  /**
   * Token, die in dieser Sitzung bewusst abgeschaltet wurden.
   *
   * Noetig, weil das hereingereichte `hike`-Objekt nach dem Abschalten noch
   * eine Weile den alten Token traegt - es wird nicht sofort neu geladen. Ohne
   * dieses Gedaechtnis wuerde der Abgleich unten den gerade widerrufenen Token
   * im naechsten Durchlauf wieder uebernehmen, und der Link saehe in der App
   * weiter aktiv aus, obwohl er es nicht mehr ist.
   */
  const abgeschaltet = useRef<Set<string>>(new Set());

  /**
   * Gleicht den Zustand mit der hereingereichten Tour ab.
   *
   * Ohne diesen Abgleich war der Abschalt-Knopf wirkungslos, und zwar im
   * Regelfall: `useActiveHike` laedt die Tour in einem Effekt, beim ersten
   * Rendern ist sie deshalb **immer** null. Die Anfangswerte von `useState`
   * oben greifen aber nur bei genau diesem ersten Rendern - kommt die Tour
   * einen Augenblick spaeter mit einem laufenden Link herein, bleibt der Hook
   * auf 'idle' und `token` auf null. `stop()` steigt dann sofort wieder aus,
   * und der Nutzer kann seinen eigenen Live-Link nicht mehr widerrufen,
   * obwohl der Knopf vor ihm steht. Betroffen war jeder, der den SOS-Bereich
   * zwischendurch verlassen oder die App neu gestartet hat.
   *
   * Uebernommen wird nur, wenn der Hook selbst noch keinen Token hat. Sonst
   * wuerde ein gerade frisch gestarteter Link vom veralteten `hike`-Objekt
   * wieder ueberschrieben - das Objekt wird nach dem Start nicht neu geladen.
   */
  useEffect(() => {
    if (!hike) {
      setToken(null);
      setViewUrl(null);
      setExpiresAt(null);
      setStatus('idle');
      return;
    }
    if (token) return;

    const laeuftNoch = Boolean(hike.shareToken) && (hike.shareExpiresAt ?? 0) > Date.now();
    if (!laeuftNoch) return;

    const gefunden = hike.shareToken as string;
    if (abgeschaltet.current.has(gefunden)) return;
    setToken(gefunden);
    // Die Adresse steht nicht in der Datenbank, nur der Token - ohne sie
    // blendet die Oberflaeche den Abschalt-Knopf aus.
    setViewUrl(buildViewUrl(gefunden));
    setExpiresAt(hike.shareExpiresAt ?? null);
    setStatus('active');
  }, [hike, token]);

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
    // Vor dem Abschalten vormerken, nicht danach: Sonst koennte der Abgleich
    // oben in der Zwischenzeit zuschlagen und den Token wieder uebernehmen.
    abgeschaltet.current.add(token);
    await stopLiveShare(hike.id, token);
    setToken(null);
    setViewUrl(null);
    setExpiresAt(null);
    setStatus('idle');
  }, [hike, token]);

  return { status, viewUrl, expiresAt, start, stop };
}
