/**
 * Claridad design tokens — premium editorial scanner.
 * Source of truth: docs/claridad-design-board.png
 */

export const palette = {
  background: {
    ivory: '#F4F0E8',
    ivoryDeep: '#EEE9DF',
    paper: '#FBF8F2',
    elevated: '#FFFFFF',
    dark: '#101013',
    darkElevated: '#1B1B20',
    darkSurface: '#232329',
  },
  accent: {
    primary: '#5B4FD6',
    primaryDeep: '#4A3FB8',
    primaryPressed: '#3F36A0',
    primaryMuted: '#ECE9FB',
    primarySoft: '#F3F1FC',
    ring: '#8B7BF0',
  },
  text: {
    primary: '#1B1A17',
    secondary: '#6A645C',
    tertiary: '#9C958A',
    inverse: '#FFFFFF',
    onDark: '#F6F3ED',
    onDarkMuted: '#9B958C',
  },
  border: {
    subtle: '#E7E1D6',
    warm: '#E2DACB',
    strong: '#D3CABA',
    focus: '#5B4FD6',
  },
  /** Warm paper surfaces and ruled lines for the editorial sheet feel. */
  paper: {
    base: '#FBF8F2',
    warm: '#F7F2E8',
    shadow: '#EAE3D5',
    edge: '#E4DCCC',
    line: '#E8E0D0',
    aged: '#F1EADB',
  },
  /** Simulated handwriting ink. */
  ink: {
    primary: '#3A342B',
    soft: '#5B5346',
    faint: '#8A8170',
  },
  /** Dark desk surface for the camera capture scene. */
  desk: {
    base: '#161310',
    wood: '#2A2118',
    woodDeep: '#191510',
    grain: 'rgba(255, 246, 230, 0.04)',
    vignette: 'rgba(0, 0, 0, 0.55)',
  },
  topic: {
    work: '#E7EFFD',
    workAccent: '#3A6DD0',
    shopping: '#FBF0D8',
    shoppingAccent: '#B07D17',
    ideas: '#E7F2E9',
    ideasAccent: '#3B8B5C',
    project: '#EFEAFC',
    projectAccent: '#6E54C4',
  },
  semantic: {
    doubt: '#FBEFD2',
    doubtBorder: '#E0A33A',
    doubtText: '#8A5A12',
    success: '#D9F2E1',
    successText: '#2E7D52',
    danger: '#FBE2E0',
    dangerText: '#C0392B',
  },
  overlay: {
    scrim: 'rgba(27, 26, 23, 0.45)',
    capture: 'rgba(16, 16, 19, 0.92)',
  },
  /** Orb gradient stops (processing screen). */
  glow: {
    core: '#A78BFA',
    mid: '#6D5DE8',
    edge: '#3B2F8F',
    halo: 'rgba(139, 123, 240, 0.0)',
  },
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 34,
  pill: 999,
} as const;

export const shadows = {
  /** Barely-there lift for resting cards. */
  soft: {
    shadowColor: '#1B1A17',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  /** Card with clear but gentle elevation. */
  card: {
    shadowColor: '#2A2620',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
  /** Floating paper sheet, warmer and deeper. */
  paper: {
    shadowColor: '#6B5E45',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 26,
    elevation: 7,
  },
  /** Floating action button glow. */
  fab: {
    shadowColor: '#5B4FD6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 9,
  },
} as const;

export const layout = {
  screenPaddingHorizontal: spacing.lg,
  screenPaddingVertical: spacing.md,
  maxContentWidth: 480,
  minTouchTarget: 44,
} as const;

export const tokens = {
  palette,
  spacing,
  radius,
  shadows,
  layout,
} as const;

export type Palette = typeof palette;
export type Spacing = typeof spacing;
