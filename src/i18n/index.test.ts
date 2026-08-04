jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => []),
}));

import * as Localization from 'expo-localization';

import { resolveDeviceLanguage } from './index';

const getLocalesMock = Localization.getLocales as jest.Mock;

describe('resolveDeviceLanguage', () => {
  it('waehlt Deutsch, wenn das Geraet auf Deutsch eingestellt ist', () => {
    getLocalesMock.mockReturnValue([{ languageCode: 'de' }]);
    expect(resolveDeviceLanguage()).toBe('de');
  });

  it('waehlt Englisch, wenn das Geraet auf Englisch eingestellt ist', () => {
    getLocalesMock.mockReturnValue([{ languageCode: 'en' }]);
    expect(resolveDeviceLanguage()).toBe('en');
  });

  it('faellt auf Englisch zurueck, wenn die Geraetesprache nicht unterstuetzt wird', () => {
    getLocalesMock.mockReturnValue([{ languageCode: 'fr' }]);
    expect(resolveDeviceLanguage()).toBe('en');
  });

  it('nimmt die erste unterstuetzte Sprache aus mehreren Geraete-Praeferenzen', () => {
    getLocalesMock.mockReturnValue([{ languageCode: 'it' }, { languageCode: 'de' }]);
    expect(resolveDeviceLanguage()).toBe('de');
  });
});
