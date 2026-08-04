import { createMMKV } from 'react-native-mmkv';

/** react-native-mmkv hat eine eigene Web-Implementierung (localStorage-basiert), braucht also kein Platform-Gate. */
const storage = createMMKV();

const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

export function isOnboardingComplete(): boolean {
  return storage.getBoolean(ONBOARDING_COMPLETE_KEY) ?? false;
}

export function setOnboardingComplete(value: boolean): void {
  storage.set(ONBOARDING_COMPLETE_KEY, value);
}

/** Loescht alle lokal gespeicherten Einstellungen - Teil des "App zuruecksetzen"-Buttons. */
export function clearAllSettings(): void {
  storage.clearAll();
}
