/**
 * Font-Stacks aus dem naturlust.net Theme. React Native kennt keine
 * CSS-Font-Fallback-Listen, daher wird jeweils die erste plattformnahe
 * Schrift verwendet; die Original-Stacks bleiben als Referenz dokumentiert.
 */
export const fontFamily = {
  // Original-Web-Stack: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif
  serif: 'Georgia',
  // Original-Web-Stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
  sans: 'System',
} as const;

export const fontSize = {
  small: 13,
  medium: 16,
  large: 20,
  xLarge: 28,
  xxLarge: 40,
} as const;

export const radius = {
  small: 8,
  medium: 12,
  large: 16,
  pill: 999,
} as const;
