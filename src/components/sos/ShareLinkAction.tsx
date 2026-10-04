import * as Location from 'expo-location';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { useShareLink } from '../../hooks/useShareLink';
import {
  FIX_RETRY_INTERVAL_MS,
  rateAccuracy,
  roundAccuracy,
  shouldKeepWaiting,
} from '../../services/location/shareAccuracy';
import { semanticColors } from '../../theme/colors';
import { fontFamily, fontSize, radius } from '../../theme/typography';
import type { Hike } from '../../types/hike';

const WHATSAPP_GREEN = '#25D366';

interface ShareLinkActionProps {
  hike: Hike | null;
}

/**
 * Zwei Wege, den Standort zu teilen:
 * 1. Einmaliger Schnappschuss (Google-Maps-Link fuer genau diesen Moment) -
 *    funktioniert immer, auch ohne Backend.
 * 2. Live-Standort-Link (ueber den Cloudflare-Relay) - aktualisiert sich
 *    laufend, solange die Freigabe aktiv ist, und laesst sich jederzeit
 *    widerrufen.
 */
export function ShareLinkAction({ hike }: ShareLinkActionProps) {
  const { t } = useTranslation();
  const [isSharing, setIsSharing] = useState(false);
  const liveShare = useShareLink(hike);

  /** Holt den aktuellen Standort und baut die Teilen-Nachricht. Gibt null zurueck, wenn abgebrochen wurde. */
  async function buildLocationMessage(): Promise<string | null> {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      if (!canAskAgain) {
        // Ein erneuter Berechtigungs-Dialog wuerde nichts mehr bringen (dauerhaft abgelehnt) -
        // einziger Weg zurueck ist ueber die System-Einstellungen der App.
        Alert.alert(t('sos.locationNeededTitle'), t('sos.locationNeededBodyPermanent'), [
          { text: t('sos.openSettings'), onPress: () => Linking.openSettings() },
          { text: t('hike.cancel'), style: 'cancel' },
        ]);
      } else {
        Alert.alert(t('sos.locationNeededTitle'), t('sos.locationNeededBody'));
      }
      return null;
    }
    // Der erste Standort nach dem Aufwachen ist oft der zuletzt bekannte oder
    // eine Funkzellen-Schaetzung. Deshalb ein kurzes Fenster lang nachfragen,
    // bis ein brauchbarer Fix da ist - aber nur kurz, im Ernstfall darf die
    // Nachricht nicht warten.
    const begonnenUm = Date.now();
    let position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    while (shouldKeepWaiting(position.coords.accuracy, Date.now() - begonnenUm)) {
      await new Promise((resolve) => setTimeout(resolve, FIX_RETRY_INTERVAL_MS));
      const naechster = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      // Den schlechteren Wert nicht uebernehmen - der bisher beste bleibt stehen.
      if ((naechster.coords.accuracy ?? Infinity) < (position.coords.accuracy ?? Infinity)) {
        position = naechster;
      }
    }

    const { latitude, longitude, accuracy } = position.coords;
    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

    // Die Genauigkeit gehoert in die Nachricht. Ohne sie kann der Empfaenger
    // einen Standort, der auf 5 m stimmt, nicht von einem unterscheiden, der
    // 300 m daneben liegt - und sieht in beiden Faellen nur eine Stecknadel.
    const quality = rateAccuracy(accuracy);
    if (quality === 'good') {
      return t('sos.shareMessageAccurate', {
        url: mapsUrl,
        meters: roundAccuracy(accuracy as number),
      });
    }
    if (quality === 'rough') {
      return t('sos.shareMessageRough', {
        url: mapsUrl,
        meters: roundAccuracy(accuracy as number),
      });
    }
    return t('sos.shareMessage', { url: mapsUrl });
  }

  async function handleShare() {
    setIsSharing(true);
    try {
      const message = await buildLocationMessage();
      if (!message) return;
      await Share.share({ message });
    } catch {
      Alert.alert(t('sos.locationFailedTitle'), t('sos.locationFailedBody'));
    } finally {
      setIsSharing(false);
    }
  }

  async function handleShareViaWhatsApp() {
    setIsSharing(true);
    try {
      const message = await buildLocationMessage();
      if (!message) return;
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (!supported) {
        Alert.alert(t('sos.whatsappNotInstalledTitle'), t('sos.whatsappNotInstalledBody'));
        return;
      }
      await Linking.openURL(whatsappUrl);
    } catch {
      Alert.alert(t('sos.locationFailedTitle'), t('sos.locationFailedBody'));
    } finally {
      setIsSharing(false);
    }
  }

  async function handleStartLiveShare() {
    const url = await liveShare.start();
    if (url) {
      await Share.share({ message: t('sos.liveShareMessage', { url }) });
      return;
    }
    // Bewusst am Rueckgabewert entschieden und nicht an liveShare.status:
    // Der stammt aus dem Render, der diese Funktion erzeugt hat, und ist nach
    // dem await veraltet. Beim Geraetetest am 04.10.2026 fiel das auf - der
    // erste Fehlversuch blieb stumm, der Knopf sprang kommentarlos zurueck.
    // Erst beim zweiten erschien die Meldung, weil die Closure dann den
    // Fehlerzustand des ersten Versuchs trug. Ausgerechnet der erste
    // Fehlschlag ist aber der, bei dem jemand eine Erklaerung braucht.
    Alert.alert(t('sos.liveShareErrorTitle'), t('sos.liveShareError'));
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          onPress={handleShare}
          disabled={isSharing}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.text}>{isSharing ? t('sos.shareButtonLoading') : t('sos.shareButtonIdle')}</Text>
        </Pressable>

        <Pressable
          onPress={handleShareViaWhatsApp}
          disabled={isSharing}
          style={({ pressed }) => [styles.button, styles.whatsappButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.whatsappText}>{t('sos.shareViaWhatsApp')}</Text>
        </Pressable>
      </View>

      {hike && (
        <View style={styles.liveShareCard}>
          <Text style={styles.liveShareTitle}>{t('sos.liveShareTitle')}</Text>

          {liveShare.status === 'active' && liveShare.viewUrl ? (
            <>
              <Text style={styles.liveShareHint}>{t('sos.liveShareActiveHint')}</Text>
              <Text selectable style={styles.liveShareUrl}>
                {liveShare.viewUrl}
              </Text>
              <View style={styles.row}>
                <Pressable
                  onPress={() => Share.share({ message: t('sos.liveShareMessage', { url: liveShare.viewUrl }) })}
                  style={({ pressed }) => [styles.button, styles.liveShareButton, pressed && styles.buttonPressed]}
                >
                  <Text style={styles.text}>{t('sos.liveShareShare')}</Text>
                </Pressable>
                <Pressable
                  onPress={() => liveShare.stop()}
                  style={({ pressed }) => [styles.button, styles.liveShareStopButton, pressed && styles.buttonPressed]}
                >
                  <Text style={styles.stopText}>{t('sos.liveShareStop')}</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.liveShareHint}>{t('sos.liveShareExplanation')}</Text>
              <Pressable
                onPress={handleStartLiveShare}
                disabled={liveShare.status === 'creating'}
                style={({ pressed }) => [styles.button, styles.liveShareButton, pressed && styles.buttonPressed]}
              >
                <Text style={styles.text}>
                  {liveShare.status === 'creating' ? t('sos.liveShareStarting') : t('sos.liveShareStart')}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  row: {
    gap: 8,
    marginTop: 8,
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    backgroundColor: semanticColors.accent,
    borderRadius: radius.medium,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappButton: {
    backgroundColor: WHATSAPP_GREEN,
  },
  liveShareButton: {
    backgroundColor: semanticColors.primary,
  },
  liveShareStopButton: {
    backgroundColor: semanticColors.danger,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  text: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.medium,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  stopText: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.medium,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  whatsappText: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.medium,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  liveShareCard: {
    backgroundColor: semanticColors.surface,
    borderRadius: radius.medium,
    padding: 16,
    marginTop: 8,
  },
  liveShareTitle: {
    fontFamily: fontFamily.serif,
    fontSize: fontSize.medium,
    color: semanticColors.textPrimary,
    marginBottom: 4,
  },
  liveShareHint: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    color: semanticColors.textSecondary,
    marginBottom: 8,
  },
  liveShareUrl: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    color: semanticColors.primary,
    marginBottom: 4,
  },
});
