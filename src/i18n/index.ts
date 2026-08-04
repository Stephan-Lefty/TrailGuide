import * as Localization from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { de } from './locales/de';
import { en } from './locales/en';

const SUPPORTED_LANGUAGES = ['de', 'en'] as const;
const FALLBACK_LANGUAGE = 'en';

export function resolveDeviceLanguage(): string {
  const deviceLocales = Localization.getLocales();
  for (const locale of deviceLocales) {
    const code = locale.languageCode?.toLowerCase();
    if (code && (SUPPORTED_LANGUAGES as readonly string[]).includes(code)) {
      return code;
    }
  }
  return FALLBACK_LANGUAGE;
}

i18next.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: resolveDeviceLanguage(),
  fallbackLng: FALLBACK_LANGUAGE,
  resources: {
    de: { translation: de },
    en: { translation: en },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
