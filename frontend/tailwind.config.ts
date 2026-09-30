import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        beige: {
          50: '#F5F2EE',
          100: '#ECE6DD',
          200: '#D4CCC2',
          300: '#B8AC9D',
          400: '#9C8B78',
          500: '#7A6A55',
        },
        slate: {
          800: '#1A1F2E',
          900: '#0F1320',
        },
        accent: {
          teal:   '#FAB95B', // primary gold
          indigo: '#1A3263', // deep navy
          amber:  '#D49543', // dark gold hover
          rose:   '#B85450', // terracotta — danger
        },
        gold:    '#FAB95B',
        'gold-dk':'#D49543',
        navy:    '#1A3263',
        steel:   '#547792',
        pearl:   '#E8E2DB',
        surface: '#E8E2DB',
        card: '#F0EBE4',
        border: '#D4CCC2',
        'text-primary': '#1A1F2E',
        'text-secondary': '#5C6577',
        'text-muted': '#8A92A0',
        teal:   { 700: '#7A4F0E' },
        indigo: { 700: '#1A3263' },
        amber:  { 700: '#7A4F0E' },
        rose:   { 700: '#8B3A3A' },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(26, 31, 46, 0.06)',
        card: '0 12px 40px -8px rgba(26, 31, 46, 0.10)',
        glass: '0 8px 32px rgba(26, 31, 46, 0.08), inset 0 0 0 1px rgba(255,255,255,0.55)',
        gold: '0 8px 24px rgba(250, 185, 91, 0.35)',
        'gold-lg': '0 12px 32px rgba(250, 185, 91, 0.45)',
      },
      borderRadius: {
        xs: '0.25rem',
      },
      animation: {
        'fade-in': 'fade-in-up 0.6s ease-out both',
        marquee: 'marquee 28s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
