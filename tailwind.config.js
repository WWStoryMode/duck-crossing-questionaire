/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FBF8F1',
        navy: { DEFAULT: '#1B2A41', light: '#3A4A63' },
        moss: { DEFAULT: '#4E7A52', light: '#DCE8DA' },
        sun: { DEFAULT: '#E9C46A', light: '#FBEFCB' },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
