import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: "#FACC15",
          500: "#EAB308",
          600: "#CA8A04",
        },
        cyber: {
          neon: "#00FF66",
          purple: "#A855F7",
          pink: "#EC4899",
          blue: "#06B6D4",
          dark: "#0A0A0F",
          card: "#12121A",
          border: "#1E1E2D",
        },
      },
    },
  },
  plugins: [],
};

export default config;
