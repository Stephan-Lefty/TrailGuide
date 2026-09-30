import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import '../i18n';
import '../services/location/backgroundLocationService';
import { semanticColors } from '../theme/colors';

export default function RootLayout() {
  const { t } = useTranslation();

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {/*
        Seit Android 15 zeichnen Apps grundsaetzlich bis unter die System-
        leisten ("edge to edge"). Ohne Beruecksichtigung des unteren Randes
        verschwindet Inhalt hinter der Navigationsleiste - auf dem Start-
        bildschirm betrifft das ausgerechnet den SOS-Knopf. Nur die untere
        Kante wird hier freigehalten; oben uebernimmt das der Stack-Header.
      */}
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: semanticColors.background },
            headerTintColor: semanticColors.textPrimary,
            contentStyle: { backgroundColor: semanticColors.background },
          }}
        >
          <Stack.Screen name="index" options={{ title: t('common.appName') }} />
          <Stack.Screen name="onboarding" options={{ title: t('onboarding.title') }} />
          <Stack.Screen name="hike/start" options={{ title: t('hike.startScreenTitle') }} />
          <Stack.Screen name="settings/index" options={{ title: t('settingsMenu.title') }} />
          <Stack.Screen name="settings/contacts" options={{ title: t('settingsContacts.title') }} />
          <Stack.Screen name="settings/about" options={{ title: t('settingsAbout.title') }} />
          <Stack.Screen name="hikes/index" options={{ title: t('hikesList.title') }} />
          <Stack.Screen
            name="sos"
            options={{
              title: t('sos.screenTitle'),
              presentation: 'modal',
              headerStyle: { backgroundColor: semanticColors.danger },
              headerTintColor: '#ffffff',
            }}
          />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: semanticColors.background,
  },
});
