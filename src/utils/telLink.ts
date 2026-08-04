import { Alert, Linking } from 'react-native';

import i18n from '../i18n';

/** Baut einen tel:-Link und öffnet den nativen Dialer. Wirft keine Exceptions in die UI. */
export async function callNumber(rawNumber: string): Promise<void> {
  const sanitized = rawNumber.replace(/[^0-9+]/g, '');
  const url = `tel:${sanitized}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert(i18n.t('sos.callNotPossibleTitle'), i18n.t('sos.callNotPossibleBody'));
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert(i18n.t('sos.callFailedTitle'), i18n.t('sos.callFailedBody'));
  }
}
