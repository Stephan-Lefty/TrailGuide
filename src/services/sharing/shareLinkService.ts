import { setShareLink } from '../hike/hikeRepository';
import { createTrackLink, pushTrackLocation, revokeTrackLink, type RelayLocation } from './relayApiClient';

export interface LiveShare {
  token: string;
  viewUrl: string;
  expiresAt: number;
}

/** Erstellt einen neuen Live-Link und verknuepft ihn mit der Wanderung (fuer Persistenz/Wiederanzeige). */
export async function startLiveShare(hikeId: string, ttlMinutes: number): Promise<LiveShare> {
  const { token, viewUrl, expiresAt } = await createTrackLink(ttlMinutes);
  setShareLink(hikeId, token, expiresAt);
  return { token, viewUrl, expiresAt };
}

/**
 * Beendet einen Live-Link.
 *
 * Gibt zurueck, ob der Relay den Widerruf bestaetigt hat. Der lokale Eintrag
 * wird in jedem Fall geloescht, auch wenn der Widerruf scheitert.
 *
 * Das ist bewusst so herum: Ein Token, den wir lokal behalten, nuetzt nichts -
 * nach dem Beenden der Aktivitaet ruft ihn niemand mehr auf, er wuerde in der
 * Oberflaeche nur einen Link vorspiegeln, der niemandem mehr gehoert. Bleibt
 * der Widerruf aus, weil kein Netz da ist, greift die feste Ablaufzeit des
 * Tokens - genau dafuer gibt es sie.
 */
export function stopLiveShare(hikeId: string, token: string): Promise<boolean> {
  // Zuerst lokal vergessen, dann erst den Relay benachrichtigen. Die
  // Reihenfolge ist der Kern: Der Aufrufer steht im Weg eines Nutzers, der
  // gerade "Freigabe beenden" oder "Aktivität beenden" getippt hat, und der
  // soll nicht auf das Netz warten.
  //
  // Wie wichtig das ist, zeigte der Geraetetest am 04.10.2026: Auf einem Netz
  // mit kaputtem IPv6 brauchte schon der erste Relay-Aufruf fuenf Minuten.
  // Solange darf nichts in der Oberflaeche haengen.
  setShareLink(hikeId, null, null);
  return revokeTrackLink(token);
}

export async function pushLocationToShare(token: string, location: RelayLocation): Promise<boolean> {
  return pushTrackLocation(token, location);
}
