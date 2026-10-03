import { createTrackEntry, deleteTrackEntry, getTrackEntry, updateTrackLocation } from './lib/kv';
import { generateToken } from './lib/token';
import { renderTrackView } from './views/trackView';

export interface Env {
  LOCATION_KV: KVNamespace;
}

const DEFAULT_TTL_MINUTES = 360; // 6 Stunden
const MAX_TTL_MINUTES = 60 * 24; // 24 Stunden Obergrenze, auch wenn ein Client mehr anfragt

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function isValidCoordinate(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    // POST /api/track/new
    if (pathname === '/api/track/new' && method === 'POST') {
      let ttlMinutes = DEFAULT_TTL_MINUTES;
      try {
        const body = (await request.json()) as { ttlMinutes?: number };
        if (typeof body.ttlMinutes === 'number' && body.ttlMinutes > 0) {
          ttlMinutes = Math.min(body.ttlMinutes, MAX_TTL_MINUTES);
        }
      } catch {
        // kein/ungueltiger Body -> Standard-TTL verwenden
      }

      const token = generateToken();
      const entry = await createTrackEntry(env.LOCATION_KV, token, ttlMinutes);
      return json({
        token,
        viewUrl: `${url.origin}/view/${token}`,
        expiresAt: entry.expiresAt,
      });
    }

    const trackMatch = pathname.match(/^\/api\/track\/([A-Za-z0-9]+)(\/revoke)?$/);
    if (trackMatch) {
      const [, token, revokeSuffix] = trackMatch;

      // POST /api/track/:token/revoke
      if (revokeSuffix && method === 'POST') {
        await deleteTrackEntry(env.LOCATION_KV, token);
        return json({ revoked: true });
      }

      // POST /api/track/:token
      if (!revokeSuffix && method === 'POST') {
        let body: {
          latitude?: unknown;
          longitude?: unknown;
          accuracy?: unknown;
          timestamp?: unknown;
          stationarySince?: unknown;
        };
        try {
          body = await request.json();
        } catch {
          return json({ error: 'invalid_json' }, 400);
        }
        if (!isValidCoordinate(body.latitude) || !isValidCoordinate(body.longitude)) {
          return json({ error: 'invalid_coordinates' }, 400);
        }
        const updated = await updateTrackLocation(env.LOCATION_KV, token, {
          latitude: body.latitude,
          longitude: body.longitude,
          accuracy: isValidCoordinate(body.accuracy) ? body.accuracy : null,
          timestamp: isValidCoordinate(body.timestamp) ? body.timestamp : Date.now(),
          // Apps vor 1.0.4 senden das Feld nicht - dann bleibt es null, und die
          // Anzeige verhaelt sich wie bisher.
          stationarySince: isValidCoordinate(body.stationarySince) ? body.stationarySince : null,
        });
        if (!updated) {
          return json({ error: 'not_found_or_expired' }, 404);
        }
        return json({ ok: true });
      }

      // GET /api/track/:token
      if (!revokeSuffix && method === 'GET') {
        const entry = await getTrackEntry(env.LOCATION_KV, token);
        if (!entry) {
          return json({ error: 'not_found_or_expired' }, 404);
        }
        return json({ location: entry.location, expiresAt: entry.expiresAt });
      }
    }

    // GET /view/:token
    const viewMatch = pathname.match(/^\/view\/([A-Za-z0-9]+)$/);
    if (viewMatch && method === 'GET') {
      const [, token] = viewMatch;
      return new Response(renderTrackView(token), {
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }

    return json({ error: 'not_found' }, 404);
  },
};
