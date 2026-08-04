import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '../i18n';
import '../services/location/backgroundLocationService';
import { semanticColors } from '../theme/colors';

export default function RootLayout() {
  const { t } = useTranslation();

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
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
    </SafeAreaProvider>
  );
}
