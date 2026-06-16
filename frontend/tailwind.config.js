/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4e99a3',
        'dark-bg': '#0b0f12',
        'muted': '#99bdbc',
        'cyan-light': '#e6f7f7',
        'cyan-subtle': '#e8fbfb',
      },
    },
  },
  plugins: [],
}
