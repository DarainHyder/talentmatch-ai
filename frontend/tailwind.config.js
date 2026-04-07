// ===== FILE: ./tailwind.config.js =====
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
          900: "#0a0f1e", // Primary BG
          800: "#0d1526", // Section Alt BG
          700: "#111827", // Card BG
        },
        accent: {
          purple: "#7c3aed", // Vibrant Purple
          "purple-hover": "#8b5cf6",
        },
      },
      backgroundImage: {
        'purple-gradient': 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
      },
    },
  },
  plugins: [],
}