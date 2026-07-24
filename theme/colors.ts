export const colors = {
  bg: '#0B1220',
  bgTop: '#101A38',
  surface: '#172839',
  surfaceRaised: '#1E2F47',
  border: 'rgba(148,163,255,0.10)',

  primary: '#8B95F6',
  primaryPressed: '#737EE6',
  primarySoft: 'rgba(139,149,246,0.14)',
  brand: '#313895',
  onPrimary: '#FFFFFF',

  teal: '#5AD6BE',
  green: '#34D399',
  gold: '#F0B45A',
  coral: '#F08E7D',
  sky: '#6FB6F2',
  violet: '#A78BFA',
  amber: '#F5C468',

  text: '#EEF1FD',
  textSecondary: '#9BA5C9',
  textMuted: '#626C91',

  tabBar: '#0D1526',
  tabInactive: '#626C91',

  ringGradient: ['#E8EFFD', '#95A6CB', '#5D66E8'] as const,
} as const;

export type AccentColor = keyof Pick<
  typeof colors,
  'primary' | 'teal' | 'sky' | 'violet' | 'amber' | 'coral' | 'gold' | 'green'
>;
