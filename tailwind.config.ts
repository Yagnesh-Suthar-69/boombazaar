import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Firecracker / Festive Embers Palette
        brand: {
          dark: "#080a11",
          smoke: "#0f1422",
          surface: "#171e31",
          card: "#131929",
          border: "#26324d",
          muted: "#94a3b8",
        },
        fire: {
          50: "#fff1f1",
          100: "#ffdfdf",
          200: "#ffc5c5",
          300: "#ff9d9d",
          400: "#ff6464",
          500: "#ef233c", // Vibrant Firecracker Crimson
          600: "#d90429", // Explosive Red
          700: "#b50422",
          800: "#8f061c",
          900: "#600615",
          accent: "#ff0033",
        },
        spark: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b", // Warm Sparkler Gold
          600: "#d97706",
          700: "#b45309",
          glow: "#ffb703",
        },
        flame: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316", // Saffron / Rocket Flame Orange
          600: "#ea580c",
          700: "#c2410c",
          neon: "#ff5400",
        },
      },
      backgroundImage: {
        "fire-gradient": "linear-gradient(135deg, #d90429 0%, #f97316 50%, #f59e0b 100%)",
        "gold-gradient": "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fef08a 100%)",
        "dark-radial": "radial-gradient(circle at 50% 20%, rgba(217, 4, 41, 0.18) 0%, rgba(8, 10, 17, 0.98) 75%)",
        "smoke-gradient": "linear-gradient(180deg, #0f1422 0%, #080a11 100%)",
      },
      boxShadow: {
        "glow-fire": "0 0 25px -3px rgba(239, 35, 60, 0.45)",
        "glow-spark": "0 0 25px -3px rgba(245, 158, 11, 0.45)",
        "glow-subtle": "0 8px 30px rgba(0, 0, 0, 0.35)",
      },
      keyframes: {
        sparkle: {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        flicker: {
          "0%, 100%": { opacity: "0.95" },
          "50%": { opacity: "0.75" },
        },
      },
      animation: {
        sparkle: "sparkle 2s ease-in-out infinite",
        flicker: "flicker 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
