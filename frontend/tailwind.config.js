// ===== FILE: ./tailwind.config.js =====
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'system-ui', 'sans-serif'],
      },
      colors: {
        teal: {
          400: '#26E4E4',
          500: '#26E4E4',
          600: '#0bdcdc',
          700: '#006a6a',
        },
        navy: {
          900: '#0F172A',
          800: '#1e293b',
          700: '#334155',
        },
      },
      backgroundImage: {
        'teal-gradient': 'linear-gradient(135deg, #006a6a 0%, #26E4E4 100%)',
      },
    },
  },
  plugins: [],
}