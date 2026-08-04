/**
 * Farbpalette, 1:1 aus dem theme.json von naturlust.net uebernommen,
 * damit die App optisch zur bestehenden Homepage passt.
 */
export const colors = {
  paper: '#f7f1e3',
  paperShadow: '#ebe1c8',
  ink: '#1f2a23',
  inkSoft: '#3d4a3f',
  forest: '#2c4a2f',
  forestDeep: '#1a2f1d',
  lake: '#7aa7c7',
  sky: '#cfe2ed',
  berry: '#8b3a3a',
  sand: '#d9c79a',
} as const;

export type ColorToken = keyof typeof colors;

/** Semantische Zuordnung, damit Screens nie direkt auf Hex-Werte zugreifen. */
export const semanticColors = {
  background: colors.paper,
  backgroundDark: colors.forestDeep,
  surface: colors.paperShadow,
  textPrimary: colors.ink,
  textSecondary: colors.inkSoft,
  primary: colors.forest,
  accent: colors.lake,
  accentSoft: colors.sky,
  danger: colors.berry,
  highlight: colors.sand,
} as const;
