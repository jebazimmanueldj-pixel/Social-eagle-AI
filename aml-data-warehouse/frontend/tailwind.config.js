/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bank: {
          50:  "#eff6ff",
          100: "#dbeafe",
          500: "#1e40af",
          600: "#1e3a8a",
          700: "#172554",
          accent: "#fbbf24",
        },
        risk: {
          low:      "#10b981",
          medium:   "#f59e0b",
          high:     "#ef4444",
          critical: "#7f1d1d",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,.06), 0 1px 4px rgba(15,23,42,.06)",
      },
    },
  },
  plugins: [],
};
