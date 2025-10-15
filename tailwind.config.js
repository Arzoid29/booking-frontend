/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    // si tienes libs:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
      colors: { primary: { DEFAULT: "#2563eb" }, muted: "#f4f4f5" },
      borderRadius: { xl: "1rem" },
      boxShadow: { soft: "0 10px 25px -10px rgba(0,0,0,.15)" },
    },
  },
  plugins: [],
};
