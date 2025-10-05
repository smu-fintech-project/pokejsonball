/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'pj-purple': '#6D28D9',
        'pj-pink': '#EC4899',
        'pj-ink': '#0B1220',
        'pj-surface': '#0F172A',
        'pj-muted': '#94A3B8'
      },
      borderRadius: {
        'xl-2': '1rem'
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ]
}
