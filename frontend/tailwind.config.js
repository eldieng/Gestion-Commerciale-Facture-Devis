/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f5ed',
          100: '#ccebdb',
          200: '#99d7b7',
          300: '#66c393',
          400: '#33af6f',
          500: '#006B3F',
          600: '#005632',
          700: '#004026',
          800: '#002b19',
          900: '#00150d',
        },
        accent: {
          50: '#f4fbe8',
          100: '#e9f7d1',
          200: '#d3efa3',
          300: '#bde775',
          400: '#a7df47',
          500: '#8DC63F',
          600: '#719e32',
          700: '#557726',
          800: '#384f19',
          900: '#1c280d',
        },
      },
    },
  },
  plugins: [],
}
