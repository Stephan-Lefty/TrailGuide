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

export async function stopLiveShare(hikeId: string, token: string): Promise<void> {
  await revokeTrackLink(token);
  setShareLink(hikeId, null, null);
}

export async function pushLocationToShare(token: string, location: RelayLocation): Promise<boolean> {
  return pushTrackLocation(token, location);
}
