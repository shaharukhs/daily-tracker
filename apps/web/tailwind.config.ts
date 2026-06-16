import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm, dignified palette: ivory surface, deep emerald primary, soft gold accent.
        cream: '#faf6f0',
        ink: '#2a2723',
        muted: '#8a8076',
        edge: '#ece4d8',
        brand: {
          50: '#eef7f3',
          100: '#d4ebe1',
          200: '#abd8c6',
          400: '#4fae8e',
          500: '#2f9576',
          600: '#1f7d61',
          700: '#185f4a',
          800: '#134a3a',
        },
        gold: {
          400: '#d8b572',
          500: '#c79a4e',
          600: '#a87f3a',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(42, 39, 35, 0.04), 0 8px 24px -12px rgba(42, 39, 35, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
