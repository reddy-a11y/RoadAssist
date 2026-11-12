/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4fc',
          100: '#e1e9f9',
          200: '#c5d5f4',
          300: '#9cbbf0',
          400: '#6d99e9',
          500: '#4878e1',
          600: '#325cd6',
          700: '#2747bf',
          800: '#1e389b',
          900: '#101B35', // Primary Deep Navy
          950: '#0a1021',
        },
        brand: {
          blue: '#2563EB',    // Electric Blue
          orange: '#F97316',  // Accent Orange
          dark: '#101B35',    // Primary Deep Navy
          light: '#F8FAFC',   // Light Grey Background
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(16, 27, 53, 0.06), 0 2px 6px -1px rgba(16, 27, 53, 0.04)',
        hover: '0 10px 25px -3px rgba(16, 27, 53, 0.1), 0 4px 10px -2px rgba(16, 27, 53, 0.05)',
      }
    },
  },
  plugins: [],
}
