/** @type {import('tailwindcss').Config} */
export default {
  important: true,
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "idb-green": "#6AAA51",
        "idb-blue": "#3782CD",
        "idb-orange": "#CF7A0B",
        "idb-yellow": "#D3B833"
      }
    },
  },
  plugins: [],
}

