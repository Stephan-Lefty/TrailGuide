import { setShareLink } from '../hike/hikeRepository';
import { revokeTrackLink } from './relayApiClient';
import { stopLiveShare } from './shareLinkService';

jest.mock('../hike/hikeRepository', () => ({
  setShareLink: jest.fn(),
}));

jest.mock('./relayApiClient', () => ({
  createTrackLink: jest.fn(),
  pushTrackLocation: jest.fn(),
  revokeTrackLink: jest.fn(),
}));

const setShareLinkMock = setShareLink as jest.Mock;
const revokeMock = revokeTrackLink as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('stopLiveShare', () => {
  it('widerruft beim Relay und loescht den lokalen Eintrag', async () => {
    revokeMock.mockResolvedValue(true);

    await expect(stopLiveShare('tour-1', 'abc123')).resolves.toBe(true);

    expect(revokeMock).toHaveBeenCalledWith('abc123');
    expect(setShareLinkMock).toHaveBeenCalledWith('tour-1', null, null);
  });

  it('loescht den lokalen Eintrag auch, wenn der Relay nicht bestaetigt', async () => {
    // Der Normalfall am Ende einer Bergtour: kein Netz.
    revokeMock.mockResolvedValue(false);

    await expect(stopLiveShare('tour-1', 'abc123')).resolves.toBe(false);

    // Einen Token zu behalten, den nach dem Beenden niemand mehr aufruft,
    // wuerde in der Oberflaeche nur einen Link vorspiegeln, der niemandem mehr
    // gehoert. Die feste Ablaufzeit des Tokens ist hier die Rueckfallebene.
    expect(setShareLinkMock).toHaveBeenCalledWith('tour-1', null, null);
  });

  it('loescht den lokalen Eintrag auch, wenn der Widerruf wirft', async () => {
    // revokeTrackLink faengt zwar selbst ab, aber darauf darf sich diese
    // Funktion nicht verlassen - sie steht im Weg des Beenden-Knopfes.
    revokeMock.mockRejectedValue(new Error('Netzwerkfehler'));

    await expect(stopLiveShare('tour-1', 'abc123')).rejects.toThrow('Netzwerkfehler');

    expect(setShareLinkMock).toHaveBeenCalledWith('tour-1', null, null);
  });
});
