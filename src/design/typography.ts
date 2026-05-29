import { TextStyle } from 'react-native';

import { palette } from './tokens';

export const fontFamily = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
} as const;

export const fontSize = {
  display: 33,
  hero: 28,
  h1: 24,
  h2: 20,
  h3: 17,
  body: 16,
  bodySmall: 14,
  caption: 12,
  label: 11,
} as const;

export const lineHeight = {
  display: 38,
  hero: 33,
  h1: 29,
  h2: 26,
  h3: 23,
  body: 23,
  bodySmall: 20,
  caption: 16,
  label: 14,
} as const;

export const letterSpacing = {
  tighter: -1,
  tight: -0.6,
  normal: 0,
  wide: 0.4,
  label: 1.2,
} as const;

export const textVariants = {
  display: {
    fontSize: fontSize.display,
    lineHeight: lineHeight.display,
    fontWeight: '800',
    letterSpacing: letterSpacing.tighter,
    color: palette.text.primary,
  },
  hero: {
    fontSize: fontSize.hero,
    lineHeight: lineHeight.hero,
    fontWeight: '800',
    letterSpacing: letterSpacing.tight,
    color: palette.text.primary,
  },
  eyebrow: {
    fontSize: fontSize.label,
    lineHeight: lineHeight.label,
    fontWeight: '700',
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: palette.accent.primary,
  },
  h1: {
    fontSize: fontSize.h1,
    lineHeight: lineHeight.h1,
    fontWeight: '700',
    letterSpacing: letterSpacing.tight,
    color: palette.text.primary,
  },
  h2: {
    fontSize: fontSize.h2,
    lineHeight: lineHeight.h2,
    fontWeight: '600',
    color: palette.text.primary,
  },
  h3: {
    fontSize: fontSize.h3,
    lineHeight: lineHeight.h3,
    fontWeight: '600',
    color: palette.text.primary,
  },
  body: {
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
    fontWeight: '400',
    color: palette.text.primary,
  },
  bodySecondary: {
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
    fontWeight: '400',
    color: palette.text.secondary,
  },
  bodySmall: {
    fontSize: fontSize.bodySmall,
    lineHeight: lineHeight.bodySmall,
    fontWeight: '400',
    color: palette.text.secondary,
  },
  caption: {
    fontSize: fontSize.caption,
    lineHeight: lineHeight.caption,
    fontWeight: '400',
    color: palette.text.tertiary,
  },
  label: {
    fontSize: fontSize.label,
    lineHeight: lineHeight.label,
    fontWeight: '600',
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
    color: palette.text.tertiary,
  },
  button: {
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
    fontWeight: '600',
    color: palette.text.inverse,
  },
  trust: {
    fontSize: fontSize.bodySmall,
    lineHeight: lineHeight.bodySmall,
    fontWeight: '500',
    color: palette.text.secondary,
  },
} as const satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textVariants;
