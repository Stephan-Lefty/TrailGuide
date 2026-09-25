import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo';

import i18n from '../../i18n';
import { presentSafetyAlert, requestNotificationPermission } from '../notifications/notificationService';

let subscription: NetInfoSubscription | null = null;
let hasSeenDisconnect = false;
let lastKnownConnected: boolean | null = null;

function isUsable(state: { isConnected: boolean | null; isInternetReachable: boolean | null }): boolean {
  // isInternetReachable ist auf Android oft null, bevor eine echte Pruefung
  // stattgefunden hat - nur isConnected als hartes Kriterium nehmen, sonst
  // gibt es Fehlalarme direkt nach dem Start.
  return state.isConnected === true;
}

export async function startConnectivityMonitoring(): Promise<void> {
  if (subscription) return; // laeuft bereits (z.B. zweite Komponente mit derselben aktiven Tour)

  await requestNotificationPermission();
  hasSeenDisconnect = false;
  lastKnownConnected = null;

  subscription = NetInfo.addEventListener((state) => {
    const connected = isUsable(state);

    if (lastKnownConnected === null) {
      // Erster Wert nach Start: nur merken, keine Meldung ausloesen.
      lastKnownConnected = connected;
      if (!connected) hasSeenDisconnect = true;
      return;
    }

    if (!connected) {
      hasSeenDisconnect = true;
    } else if (connected && hasSeenDisconnect && lastKnownConnected === false) {
      hasSeenDisconnect = false;
      void presentSafetyAlert(i18n.t('connectivityWarning.title'), i18n.t('connectivityWarning.body'));
    }

    lastKnownConnected = connected;
  });
}

export function stopConnectivityMonitoring(): void {
  subscription?.();
  subscription = null;
  hasSeenDisconnect = false;
  lastKnownConnected = null;
}
