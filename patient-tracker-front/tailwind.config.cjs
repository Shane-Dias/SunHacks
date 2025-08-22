/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#e699ae",
        "primaryLight": "#e6b8c4",
        "primaryMedium": "#e66d89"
      },
      fontFamily: {
        sans: ['Roboto Slab', 'serif'], // Changed from Inter to Roboto Slab
      },
    },
  },
  plugins: [],
}