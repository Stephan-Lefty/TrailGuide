import { REVOKE_TIMEOUT_MS, revokeTrackLink } from './relayApiClient';

const fetchMock = jest.fn();
(globalThis as unknown as { fetch: jest.Mock }).fetch = fetchMock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('revokeTrackLink', () => {
  it('meldet Erfolg, wenn der Relay bestaetigt', async () => {
    fetchMock.mockResolvedValue({ ok: true });
    await expect(revokeTrackLink('abc123')).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, optionen] = fetchMock.mock.calls[0];
    expect(url).toContain('/api/track/abc123/revoke');
    expect(optionen.method).toBe('POST');
  });

  it('meldet Misserfolg statt zu werfen, wenn kein Netz da ist', async () => {
    // Dieser Aufruf steht im Weg des Beenden-Knopfes - er darf nie werfen.
    fetchMock.mockRejectedValue(new Error('Network request failed'));
    await expect(revokeTrackLink('abc123')).resolves.toBe(false);
  });

  it('meldet Misserfolg, wenn der Relay den Token nicht kennt', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 });
    await expect(revokeTrackLink('abc123')).resolves.toBe(false);
  });

  it('bricht nach dem Zeitlimit ab, statt das Beenden aufzuhalten', async () => {
    jest.useFakeTimers();
    // Eine Verbindung, die nie antwortet - am Ende einer Bergtour der
    // Normalfall. Ohne Zeitlimit stuende die App hier minutenlang.
    fetchMock.mockImplementation(
      (_url: string, optionen: { signal: AbortSignal }) =>
        new Promise((_, ablehnen) => {
          optionen.signal.addEventListener('abort', () =>
            ablehnen(new Error('Aborted')),
          );
        }),
    );

    const laeuft = revokeTrackLink('abc123');
    jest.advanceTimersByTime(REVOKE_TIMEOUT_MS);

    await expect(laeuft).resolves.toBe(false);
    jest.useRealTimers();
  });

  it('haelt das Zeitlimit knapp genug, um niemanden warten zu lassen', () => {
    expect(REVOKE_TIMEOUT_MS).toBeLessThanOrEqual(5000);
  });
});
