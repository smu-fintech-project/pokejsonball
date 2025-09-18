/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'pj-purple': '#6D28D9',
        'pj-pink': '#EC4899'
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
