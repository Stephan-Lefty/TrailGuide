import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { stopLiveShare } from '../services/sharing/shareLinkService';
import type { Hike } from '../types/hike';
import { useShareLink } from './useShareLink';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: { High: 4 },
}));

jest.mock('../services/sharing/shareLinkService', () => ({
  startLiveShare: jest.fn(),
  stopLiveShare: jest.fn().mockResolvedValue(true),
}));

jest.mock('../services/sharing/relayApiClient', () => ({
  pushTrackLocation: jest.fn(),
  buildViewUrl: (token: string) => `https://relay.example/view/${token}`,
}));

const stopLiveShareMock = stopLiveShare as jest.Mock;

const IN_EINER_STUNDE = Date.now() + 60 * 60 * 1000;

function tour(overrides: Partial<Hike> = {}): Hike {
  return {
    id: 'tour-1',
    startedAt: Date.now() - 60_000,
    endedAt: null,
    status: 'active',
    shareToken: null,
    shareExpiresAt: null,
    ...overrides,
  };
}

/** Rendert den Hook und reicht sein Ergebnis nach aussen. */
function render(hike: Hike | null) {
  const ergebnis: { current: ReturnType<typeof useShareLink> | null } = { current: null };
  function Probe({ hike: h }: { hike: Hike | null }) {
    ergebnis.current = useShareLink(h);
    return null;
  }
  let renderer: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(<Probe hike={hike} />);
  });
  return {
    ergebnis,
    rerender: (neu: Hike | null) => act(() => renderer.update(<Probe hike={neu} />)),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  stopLiveShareMock.mockResolvedValue(true);
});

describe('useShareLink', () => {
  it('erkennt einen bereits laufenden Link, der erst nachtraeglich hereinkommt', () => {
    // Das ist der echte Ablauf: useActiveHike laedt die Tour in einem Effekt,
    // beim ersten Rendern ist sie deshalb immer null. Erst danach kommt sie an.
    const { ergebnis, rerender } = render(null);
    expect(ergebnis.current?.status).toBe('idle');

    rerender(tour({ shareToken: 'abc123', shareExpiresAt: IN_EINER_STUNDE }));

    expect(ergebnis.current?.status).toBe('active');
  });

  it('kann einen nachtraeglich hereingekommenen Link auch wieder abschalten', async () => {
    // Der Kern der Sache. Ohne Abgleich bleibt der Token im Hook null, stop()
    // steigt sofort wieder aus - und der Nutzer kann seinen eigenen Link nicht
    // mehr widerrufen, obwohl der Knopf dafuer vor ihm steht.
    const { ergebnis, rerender } = render(null);
    rerender(tour({ shareToken: 'abc123', shareExpiresAt: IN_EINER_STUNDE }));

    await act(async () => {
      await ergebnis.current?.stop();
    });

    expect(stopLiveShareMock).toHaveBeenCalledWith('tour-1', 'abc123');
    expect(ergebnis.current?.status).toBe('idle');
  });

  it('nimmt einen abgeschalteten Link nicht wieder an', async () => {
    // In diese Falle bin ich beim Bauen des Fixes selbst gelaufen. Nach dem
    // Abschalten traegt das hereingereichte hike-Objekt noch eine Weile den
    // alten Token - es wird nicht sofort neu geladen. Ohne Gedaechtnis
    // uebernimmt der Abgleich ihn im naechsten Durchlauf wieder, und der Link
    // sieht in der App weiter aktiv aus, obwohl er laengst widerrufen ist.
    const laufend = tour({ shareToken: 'abc123', shareExpiresAt: IN_EINER_STUNDE });
    const { ergebnis, rerender } = render(null);
    rerender(laufend);

    await act(async () => {
      await ergebnis.current?.stop();
    });
    expect(ergebnis.current?.status).toBe('idle');

    // Dasselbe, veraltete Objekt kommt noch einmal herein.
    rerender(laufend);

    expect(ergebnis.current?.status).toBe('idle');
    expect(stopLiveShareMock).toHaveBeenCalledTimes(1);
  });

  it('haelt einen abgelaufenen Link nicht faelschlich fuer aktiv', () => {
    const { ergebnis, rerender } = render(null);
    rerender(tour({ shareToken: 'abc123', shareExpiresAt: Date.now() - 1000 }));

    expect(ergebnis.current?.status).toBe('idle');
  });

  it('vergisst den Link, wenn die Aktivitaet endet', () => {
    const { ergebnis, rerender } = render(tour({ shareToken: 'abc123', shareExpiresAt: IN_EINER_STUNDE }));
    expect(ergebnis.current?.status).toBe('active');

    rerender(null);

    expect(ergebnis.current?.status).toBe('idle');
  });
});
