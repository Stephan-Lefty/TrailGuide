import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { semanticColors } from '../../theme/colors';
import { fontFamily, fontSize, radius } from '../../theme/typography';
import { callNumber } from '../../utils/telLink';

interface EmergencyNumberRowProps {
  label: string;
  number: string;
  emphasized?: boolean;
  /** Haltedauer in ms, bevor der Anruf ausgeloest wird. Default: kurze Haltezeit fuer normale Kontakte. */
  holdDurationMs?: number;
  /** Blendet die Telefonnummer aus (z.B. bei eigenen Kontakten - dort zaehlt nur der Name). */
  hideNumber?: boolean;
}

/** Standard-Haltedauer fuer nicht-emphasized Zeilen (z.B. eigene Kontakte). */
const DEFAULT_HOLD_DURATION_MS = 900;
/** Wie oft der Countdown waehrend des Haltens aktualisiert wird. */
const COUNTDOWN_TICK_MS = 100;

/**
 * Ein einzelner Tap darf niemals sofort einen echten Anruf ausloesen (Gefahr
 * von Fehlbedienung in der Tasche/beim Griff zum Handy). Der Anruf startet
 * erst, wenn der Balken durch Halten vollstaendig gefuellt ist; beim
 * vorzeitigen Loslassen wird der Vorgang abgebrochen. Fuer echte Notrufnummern
 * (112, Bergrettung etc.) wird bewusst eine deutlich laengere Haltezeit
 * (5 Sekunden) uebergeben, damit ein finaler Notruf nicht versehentlich
 * ausgeloest werden kann. Die benoetigte Haltezeit wird dem Nutzer sowohl im
 * Ruhezustand als auch als laufender Countdown waehrend des Haltens angezeigt.
 */
export function EmergencyNumberRow({
  label,
  number,
  emphasized = false,
  holdDurationMs = DEFAULT_HOLD_DURATION_MS,
  hideNumber = false,
}: EmergencyNumberRowProps) {
  const { t } = useTranslation();
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function clearCountdown() {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }

  function handlePressIn() {
    const pressStartedAt = Date.now();
    setRemainingMs(holdDurationMs);

    clearCountdown();
    countdownIntervalRef.current = setInterval(() => {
      setRemainingMs(Math.max(0, holdDurationMs - (Date.now() - pressStartedAt)));
    }, COUNTDOWN_TICK_MS);

    animationRef.current?.stop();
    progress.setValue(0);
    animationRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: holdDurationMs,
      useNativeDriver: false,
    });
    animationRef.current.start(({ finished }) => {
      if (finished) {
        clearCountdown();
        callNumber(number);
      }
    });
  }

  function cancelHold() {
    setRemainingMs(null);
    clearCountdown();
    animationRef.current?.stop();
    Animated.timing(progress, { toValue: 0, duration: 150, useNativeDriver: false }).start();
  }

  const holdSeconds = Math.ceil(holdDurationMs / 1000);
  const remainingSeconds = remainingMs !== null ? Math.ceil(remainingMs / 1000) : null;

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={cancelHold}
      style={({ pressed }) => [styles.row, emphasized && styles.rowEmphasized, pressed && styles.rowPressed]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.progressFill,
          emphasized ? styles.progressFillEmphasized : styles.progressFillDefault,
          {
            width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          },
        ]}
      />
      <View style={styles.textSide}>
        {!hideNumber && <Text style={[styles.label, emphasized && styles.labelEmphasized]}>{label}</Text>}
        <Text style={[styles.number, emphasized && styles.numberEmphasized]}>{hideNumber ? label : number}</Text>
      </View>
      <Text style={[styles.callHint, emphasized && styles.callHintEmphasized]}>
        {remainingSeconds !== null
          ? t('sos.callHintCountdown', { seconds: remainingSeconds })
          : t('sos.callHint', { seconds: holdSeconds })}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: semanticColors.surface,
    borderRadius: radius.medium,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 10,
    overflow: 'hidden',
  },
  rowEmphasized: {
    backgroundColor: semanticColors.danger,
    paddingVertical: 22,
  },
  rowPressed: {
    opacity: 0.9,
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  progressFillDefault: {
    backgroundColor: 'rgba(44, 74, 47, 0.18)',
  },
  progressFillEmphasized: {
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  textSide: {
    flexShrink: 1,
    marginRight: 12,
  },
  label: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    color: semanticColors.textSecondary,
  },
  labelEmphasized: {
    color: '#f7f1e3',
  },
  number: {
    fontFamily: fontFamily.serif,
    fontSize: fontSize.large,
    color: semanticColors.textPrimary,
  },
  numberEmphasized: {
    color: '#ffffff',
    fontSize: fontSize.xLarge,
  },
  callHint: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.small,
    color: semanticColors.primary,
    fontWeight: '600',
    flexShrink: 1,
    maxWidth: 90,
    textAlign: 'right',
  },
  callHintEmphasized: {
    color: '#ffffff',
  },
});
