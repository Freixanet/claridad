/**
 * Claridad design tokens — High-Fidelity SaaS
 */
export const colors = {
  background: '#FFFFFF',
  canvasMuted: '#F9FAFB',
  canvasSubtle: '#FAFAFA',
  foreground: '#111827',
  foregroundMuted: '#6B7280',
  foregroundSoft: '#9CA3AF',
  borderGhost: '#E5E7EB',
  borderStrong: '#D1D5DB',
  primary: '#2563EB',
  primarySoft: '#EFF6FF',
  primaryHover: '#1D4ED8',
  success: '#16A34A',
  warning: '#EA580C',
  danger: '#DC2626',
  accentSoft: '#FEF3C7',
};

export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
};

export const typography = {
  display: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 32,
    letterSpacing: -0.6,
    color: colors.foreground,
  },
  h1: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    letterSpacing: -0.4,
    color: colors.foreground,
  },
  h2: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    letterSpacing: -0.2,
    color: colors.foreground,
  },
  h3: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    letterSpacing: -0.1,
    color: colors.foreground,
  },
  body: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.foregroundMuted },
  bodyStrong: { fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.foreground },
  meta: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.foregroundMuted },
  metaStrong: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.foreground },
  mono: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.foreground },
};

export const categoryMeta: Record<string, { label: string; dot: string }> = {
  ideas: { label: 'Ideas', dot: '#2563EB' },
  tasks: { label: 'Tasks', dot: '#16A34A' },
  errands: { label: 'Errands', dot: '#EA580C' },
  notes: { label: 'Notes', dot: '#6B7280' },
  reminders: { label: 'Reminders', dot: '#9333EA' },
  contacts: { label: 'Contacts', dot: '#0EA5E9' },
  reflections: { label: 'Reflections', dot: '#DC2626' },
  references: { label: 'References', dot: '#0891B2' },
  other: { label: 'Other', dot: '#9CA3AF' },
};
