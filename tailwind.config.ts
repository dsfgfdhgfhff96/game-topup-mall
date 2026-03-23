import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a0f',
          card: '#111118',
          secondary: '#1a1a24',
        },
        accent: {
          purple: '#6c5ce7',
          cyan: '#00cec9',
          pink: '#fd79a8',
          gold: '#fdcb6e',
          green: '#00b894',
          red: '#d63031',
        },
        text: {
          primary: '#ffffff',
          secondary: '#a0a0b0',
          muted: '#606070',
        },
        border: {
          default: '#2a2a35',
          highlight: '#6c5ce7',
        },
      },
    },
  },
  plugins: [],
};
export default config;
