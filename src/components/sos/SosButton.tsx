import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text } from 'react-native';

import { semanticColors } from '../../theme/colors';
import { fontFamily, fontSize, radius } from '../../theme/typography';

interface SosButtonProps {
  /** Ohne aktive Wanderung ist der SOS-Schnellzugriff der App gesperrt (schliesst Fehlbedienung aus). */
  disabled?: boolean;
}

export function SosButton({ disabled = false }: SosButtonProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('sos.openLabel')}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => router.push('/sos')}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>SOS</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: semanticColors.danger,
    borderRadius: radius.pill,
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: semanticColors.surface,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  text: {
    fontFamily: fontFamily.serif,
    fontSize: fontSize.xLarge,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 2,
  },
  textDisabled: {
    color: semanticColors.textSecondary,
  },
});
