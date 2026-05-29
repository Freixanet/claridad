import { palette, radius, shadows, spacing, tokens } from './tokens';
import { textVariants } from './typography';

export const claridadTheme = {
  colors: palette,
  spacing,
  radius,
  shadows,
  text: textVariants,
  tokens,
} as const;

export type ClaridadTheme = typeof claridadTheme;
