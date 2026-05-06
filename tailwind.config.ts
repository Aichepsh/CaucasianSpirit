import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        stonepaper: "#efede8",
        bone: "#f7f5ef",
        ink: "#171615",
        soot: "#22201d",
        muted: "#77736c",
        line: "#d7d2c8",
        field: "#e8e4dc",
        danger: "#7c2d2d"
      },
      fontFamily: {
        sans: [
          "Arial Narrow",
          "Inter Tight",
          "Geist",
          "Arial",
          "Helvetica",
          "sans-serif"
        ]
      },
      letterSpacing: {
        label: "0.14em",
        tightlabel: "0.08em"
      },
      boxShadow: {
        topbar: "0 1px 0 rgba(23, 22, 21, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
