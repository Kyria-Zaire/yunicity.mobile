export const colors = {
  primary: '#2A2FFF',
  primaryDark: '#1A1ECC',
  primaryLight: '#E8E9FF',
  primaryMid: '#9395FF',
  primaryGlow: 'rgba(42,47,255,0.15)',
  dark: '#0D0F2E',
  darkMid: '#1C1F4A',
  gray: '#6B7280',
  grayLight: '#F3F4F6',
  grayMid: '#D1D5DB',
  white: '#FFFFFF',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
} as const;

export const fonts = {
  display: "'Syne', sans-serif",
  body: "'DM Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const;

export const spacing = {
  s1: '4px',
  s2: '8px',
  s3: '12px',
  s4: '16px',
  s6: '24px',
  s8: '32px',
  s12: '48px',
  s16: '64px',
} as const;

export const radius = {
  sm: '6px',
  md: '12px',
  lg: '20px',
  xl: '32px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 3px rgba(13,15,46,0.08), 0 1px 2px rgba(13,15,46,0.06)',
  md: '0 4px 16px rgba(13,15,46,0.10), 0 2px 6px rgba(13,15,46,0.07)',
  lg: '0 12px 40px rgba(13,15,46,0.14), 0 4px 12px rgba(13,15,46,0.08)',
  primary: '0 8px 32px rgba(42,47,255,0.25), 0 2px 8px rgba(42,47,255,0.15)',
  glow: '0 0 40px rgba(42,47,255,0.20)',
} as const;

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;
