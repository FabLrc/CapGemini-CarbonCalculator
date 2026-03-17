/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Charte Capgemini
        primary: {
          DEFAULT: "#0070AD",
          dark: "#005a8e",
          light: "#3399cc",
        },
        secondary: "#00A8E0",
        accent: "#003D6B",
        success: "#28A745",
        warning: "#FFC107",
        danger: "#DC3545",
        carbon: {
          low: "#28A745",
          medium: "#FFC107",
          high: "#DC3545",
        },
      },
    },
  },
  plugins: [],
};
