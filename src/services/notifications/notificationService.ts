import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const ALERT_CHANNEL_ID = 'ntg-safety-alerts';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let channelReady: Promise<void> | null = null;

/**
 * Eigener Kanal (statt Default), damit Ton/Wichtigkeit unabhaengig von
 * anderen Benachrichtigungen der App konfiguriert sind - Sicherheits-Hinweise
 * (Akku, Netz, Neustart) sollen immer mit Ton als Heads-up-Meldung kommen.
 */
async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  if (!channelReady) {
    channelReady = Notifications.setNotificationChannelAsync(ALERT_CHANNEL_ID, {
      name: 'Sicherheits-Hinweise',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    }).then(() => undefined);
  }
  await channelReady;
}

export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

export async function presentSafetyAlert(title: string, body: string): Promise<void> {
  await ensureChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
    },
    // channelId gehoert beim sofortigen Ausloesen in den Trigger, nicht in
    // den content - sonst faellt Android auf den Expo-Standardkanal zurueck.
    trigger: Platform.OS === 'android' ? { channelId: ALERT_CHANNEL_ID } : null,
  });
}
