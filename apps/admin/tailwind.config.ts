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
      },
      animation: {
        'fade-down': 'fadeDown 0.25s ease-out forwards',
        pulseDot: 'pulseDot 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.2s ease forwards',
      },
      keyframes: {
        fadeDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.2)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
