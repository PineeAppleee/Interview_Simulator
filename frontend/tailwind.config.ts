import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FDFBF7",
        foreground: "#1A1A1A",
        primary: {
          DEFAULT: "#FF7B54",
          light: "#FF9A76",
          dark: "#E85D38",
        },
        glass: {
          DEFAULT: "rgba(255, 255, 255, 0.6)",
          dark: "rgba(255, 255, 255, 0.4)",
          border: "rgba(255, 255, 255, 0.3)",
        },
        neumorph: {
          light: "#ffffff",
          dark: "#e6e4e0",
        }
      },
      backgroundImage: {
        "gradient-warm": "linear-gradient(135deg, #FF7B54 0%, #FFB26B 100%)",
        "gradient-radial": "radial-gradient(circle at center, var(--tw-gradient-stops))",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
        "glass-hover": "0 12px 40px 0 rgba(31, 38, 135, 0.12)",
        neumorph: "12px 12px 24px #e6e4e0, -12px -12px 24px #ffffff",
        "neumorph-inset": "inset 8px 8px 16px #e6e4e0, inset -8px -8px 16px #ffffff",
        "soft": "0 20px 40px -10px rgba(0,0,0,0.05)",
      },
      borderRadius: {
        "xl": "16px",
        "2xl": "20px",
        "3xl": "28px",
      },
    },
  },
  plugins: [],
};

export default config;
