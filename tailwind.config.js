/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#171717", champagne: "#c9a66b", ivory: "#faf8f3" },
      fontFamily: { display: ["Georgia", "serif"], sans: ["Inter", "Arial", "sans-serif"] }
    }
  },
  plugins: []
};