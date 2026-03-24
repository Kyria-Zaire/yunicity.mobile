import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        yunicity: {
          primary: '#2A2FFF',
          'primary-dark': '#1A1ECC',
          'primary-light': '#E8E9FF',
          'primary-mid': '#9395FF',
          dark: '#0D0F2E',
          'dark-mid': '#1C1F4A',
        },
      },
      boxShadow: {
        primary:
          '0 8px 32px rgba(42,47,255,0.25), 0 2px 8px rgba(42,47,255,0.15)',
        card: '0 2px 12px rgba(13,15,46,0.07)',
        hover: '0 8px 32px rgba(13,15,46,0.12)',
        glow: '0 0 40px rgba(42,47,255,0.20)',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '32px',
      },
      animation: {
        'fade-up': 'fadeUp 0.65s cubic-bezier(0.4,0,0.2,1) forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'scale-in': 'scaleIn 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.4,0,0.2,1) forwards',
        shimmer: 'shimmer 2s linear infinite',
        'pulse-ring': 'pulseRing 2.5s ease-in-out infinite',
        shake: 'shake 0.45s ease-in-out',
        'spin-slow': 'spin 2.5s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseRing: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(42,47,255,0.35)' },
          '50%': { boxShadow: '0 0 0 12px rgba(42,47,255,0)' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%,60%': { transform: 'translateX(-8px)' },
          '40%,80%': { transform: 'translateX(8px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
