import * as Battery from 'expo-battery';

import i18n from '../../i18n';
import { presentSafetyAlert, requestNotificationPermission } from '../notifications/notificationService';

const LOW_BATTERY_THRESHOLD = 0.15;

let subscription: Battery.Subscription | null = null;
let alreadyWarned = false;

async function checkLevel(level: number): Promise<void> {
  if (level < 0) return; // unbekannt (z.B. Emulator ohne Akku-Info)
  if (level <= LOW_BATTERY_THRESHOLD && !alreadyWarned) {
    alreadyWarned = true;
    const percent = Math.round(level * 100);
    await presentSafetyAlert(i18n.t('batteryWarning.title', { percent }), i18n.t('batteryWarning.body', { percent }));
  }
  // Wurde zwischenzeitlich wieder aufgeladen (z.B. Powerbank unterwegs):
  // erneute Warnung erst wieder erlauben, wenn der Akku wieder deutlich ueber
  // der Schwelle liegt.
  if (level > LOW_BATTERY_THRESHOLD + 0.05) {
    alreadyWarned = false;
  }
}

export async function startBatteryMonitoring(): Promise<void> {
  if (subscription) return; // laeuft bereits (z.B. zweite Komponente mit derselben aktiven Tour)

  await requestNotificationPermission();
  alreadyWarned = false;

  const initialLevel = await Battery.getBatteryLevelAsync();
  await checkLevel(initialLevel);

  subscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
    void checkLevel(batteryLevel);
  });
}

export function stopBatteryMonitoring(): void {
  subscription?.remove();
  subscription = null;
  alreadyWarned = false;
}
