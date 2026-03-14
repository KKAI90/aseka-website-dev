/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1F3A",
          mid: "#1a3357",
          light: "#E6F1FB",
        },
        accent: {
          DEFAULT: "#C8002A",
          light: "#FCEBEB",
        },
        gold: {
          DEFAULT: "#A0680A",
          light: "#FAEEDA",
        },
      },
      fontFamily: {
        sans: ["'Noto Sans JP'", "'Yu Gothic UI'", "'Hiragino Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
