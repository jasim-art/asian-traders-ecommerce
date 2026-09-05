import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: "#E36414",
          deep: "#C4520A",
          tint: "#FCE7D4",
        },
        brown: {
          DEFAULT: "#3D2B1F",
          deep: "#241A12",
        },
        bg: {
          DEFAULT: "#FBF8F3",
          alt: "#F3ECE1",
        },
        ink: {
          DEFAULT: "#2B2118",
          soft: "#6B5D50",
        },
        line: "#E4D9C8",
      },
      fontFamily: {
        display: ["var(--font-barlow)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jbmono)", "monospace"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 8px 24px rgba(61,43,31,0.10)",
        "card-lg": "0 20px 50px rgba(61,43,31,0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
