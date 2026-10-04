import {
  CREATE_TIMEOUT_MS,
  REVOKE_TIMEOUT_MS,
  createTrackLink,
  revokeTrackLink,
} from './relayApiClient';

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

  it('gibt dem Widerruf genug Zeit fuer eine traege erste Verbindung', () => {
    // Der Wert stand einmal bei 5 Sekunden - zu knapp. Beim Geraetetest am
    // 04.10.2026 brauchte der erste Relay-Aufruf auf einem Netz mit kaputtem
    // IPv6 fuenf Minuten, und der Widerruf wurde jedes Mal abgewuergt. Da
    // niemand auf ihn wartet, kostet ein grosszuegiges Limit nichts.
    expect(REVOKE_TIMEOUT_MS).toBeGreaterThanOrEqual(30_000);
  });

  it('laesst niemanden endlos auf einen neuen Link warten', () => {
    // Hier wartet jemand zu - der Knopf zeigt "Wird gestartet...". Ein Limit
    // muss es also geben, und es muss kuerzer sein als die Geduld eines
    // Menschen im Notfall.
    expect(CREATE_TIMEOUT_MS).toBeGreaterThan(0);
    expect(CREATE_TIMEOUT_MS).toBeLessThanOrEqual(30_000);
  });
});

describe('createTrackLink', () => {
  it('bricht ab, statt den Knopf endlos drehen zu lassen', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation(
      (_url: string, optionen: { signal: AbortSignal }) =>
        new Promise((_, ablehnen) => {
          optionen.signal.addEventListener('abort', () => ablehnen(new Error('Aborted')));
        }),
    );

    const laeuft = createTrackLink(360);
    jest.advanceTimersByTime(CREATE_TIMEOUT_MS);

    // Anders als der Widerruf darf das Anlegen werfen - der Aufrufer faengt es
    // ab und zeigt den Fehlerzustand, damit der Knopf wieder bedienbar wird.
    await expect(laeuft).rejects.toThrow();
    jest.useRealTimers();
  });

  it('liefert Token und Adresse, wenn der Relay antwortet', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'abc123', viewUrl: 'https://relay.example/view/abc123', expiresAt: 1 }),
    });
    await expect(createTrackLink(360)).resolves.toMatchObject({ token: 'abc123' });
  });
});
