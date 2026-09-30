/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Quicksand', 'sans-serif'], heading: ['Fredoka', 'sans-serif'] },
      colors: { brand: { 50: '#FDF2F7', 100: '#FCE7F3', 500: '#EC4899', 600: '#DB2777', 700: '#BE185D' } },
      keyframes: { fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } } },
      animation: { 'fade-in': 'fadeIn 0.6s ease-out forwards' },
    },
  },
  plugins: [],
};
