/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-red': '#8B0000', // Deep Royal Red
        'brand-gold': '#DAA520', // Goldenrod
        'brand-blue': '#1e3a8a', // Royal Blue
        'pailtha-cream': '#fdfbf7', // Off-white/Cream
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'], // For elegant headings
      }
    },
  },
  plugins: [],
}
