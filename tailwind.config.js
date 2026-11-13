/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        examino: {
          navy: "#101B35",
          "navy-light": "#1A294C",
          blue: "#2563EB",
          "blue-hover": "#1D4ED8",
          "blue-light": "#EFF6FF",
          "blue-soft": "#DBEAFE",
          amber: "#F59E0B",
          "amber-light": "#FEF3C7",
          "amber-soft": "#FFFBEB",
          green: "#10B981",
          "green-dark": "#059669",
          "green-light": "#ECFDF5",
          rose: "#EF4444",
          "rose-dark": "#DC2626",
          "rose-light": "#FEF2F2",
          bg: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0",
          text: "#0F172A",
          muted: "#64748B",
          subtle: "#94A3B8",
        },
      },
      fontFamily: {
        sans: ["Inter", "'Noto Sans Bengali'", "system-ui", "-apple-system", "sans-serif"],
        bengali: ["'Noto Sans Bengali'", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(15, 23, 42, 0.05)",
        card: "0 2px 8px -2px rgba(15, 23, 42, 0.06), 0 1px 4px -1px rgba(15, 23, 42, 0.04)",
        elevated: "0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.03)",
        dropdown: "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)",
      },
      borderRadius: {
        card: "12px",
        banner: "16px",
      },
    },
  },
  plugins: [],
};
