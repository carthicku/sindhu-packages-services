/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#EEF2F8',
          100: '#D6DFEC',
          200: '#AEBFD8',
          300: '#7D96BD',
          400: '#4D6C9E',
          500: '#2E4D80',
          600: '#1F3966',
          700: '#162B4F',
          800: '#0F1F3B',
          900: '#0A162B',
          950: '#060E1C',
        },
        amber: {
          50: '#FFF6EC',
          100: '#FFE9D1',
          200: '#FFD0A1',
          300: '#FFB167',
          400: '#FF953A',
          500: '#F57C1F',
          600: '#DB6412',
          700: '#B54C10',
          800: '#8F3C14',
          900: '#743313',
        },
        warm: {
          50: '#FDFCFA',
          100: '#FAF8F4',
          200: '#F3F0EA',
          300: '#E8E4DC',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(10,22,43,0.04), 0 8px 24px -8px rgba(10,22,43,0.12)',
        lift: '0 2px 4px rgba(10,22,43,0.05), 0 24px 48px -16px rgba(10,22,43,0.22)',
      },
      maxWidth: {
        site: '1240px',
      },
    },
  },
  plugins: [],
};
