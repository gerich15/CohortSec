/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        vg: {
          bg: "#0A0A0F",
          surface: "#14141F",
          accent: "#3B82F6",
          "accent-hover": "#2563EB",
          text: "#FFFFFF",
          muted: "#A0A0B0",
          danger: "#EF4444",
          warning: "#F59E0B",
          success: "#10B981",
        },
        primary: "#00FFAA",
        secondary: "#3B82F6",
        accentPurple: "#8B5CF6",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backdropBlur: {
        glass: "12px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(59, 130, 246, 0.3)",
        "glow-hover": "0 0 30px rgba(59, 130, 246, 0.5)",
      },
    },
  },
  plugins: [],
};
