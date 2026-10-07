/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        slack: {
          primary: "#4A154B",
          secondary: "#1A1D21",
          accent: "#36C5F0",
          bg: "#FFFFFF",
          surface: "#F8F8F8",
          ink: "#1D1C1D",
          "ink-secondary": "#696969",
          border: "#DDDDDD",
          success: "#2EB67D",
          error: "#E01E5A",
          warning: "#ECB22E",
          info: "#36C5F0",
          sidebar: "#4A154B",
          "sidebar-active": "#1164A3",
        },
      },
      fontFamily: {
        display: ["Slack Circular Pro", "Helvetica", "sans-serif"],
        mono: ["Noto Sans Mono", "SF Mono", "monospace"],
      },
      borderRadius: {
        slack: "6px",
      },
    },
  },
  plugins: [],
};
