/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#f6f7fb',100:'#eceef6',200:'#cfd5e7',300:'#aab6d3',400:'#7b8bb8',500:'#4b5f9d',600:'#34477d',700:'#293963',800:'#202d4d',900:'#111827' },
        accent: { 500:'#059669', 600:'#047857' },
      },
      borderRadius: { xl: '12px' },
    },
  },
  plugins: [],
};
