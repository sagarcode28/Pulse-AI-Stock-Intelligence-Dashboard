/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#6366f1",
        surface: "#111827",
        base: "#0f172a",
      }
    },
  },
  plugins: [],
}

