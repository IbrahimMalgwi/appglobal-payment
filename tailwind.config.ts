import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./context/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Dark surface scale (sidebar) — anchored on the spec's Dark theme tokens:
        // 950 Background, 900 Surface, 800 Surface alt, 700 Border,
        // 200 Text secondary, 50 Text primary. 100/300–600 are interpolated steps.
        navy: {
          50: "#F4F8FC", // Text primary (dark theme)
          100: "#D7E0EA",
          200: "#94A0B4", // Text secondary (dark theme)
          300: "#7A879C",
          400: "#5E6D82",
          500: "#445269",
          600: "#2E3E56",
          700: "#223449", // Border (dark theme)
          800: "#1B2F4A", // Surface alt (dark theme)
          900: "#13233A", // Surface (dark theme)
          950: "#0B1524", // Background (dark theme)
        },
        // Primary interactive blue — anchored on spec's Primary blue (#1BA2FF).
        // brand-50 doubles as the spec's "Icon bg" (#E4F1F9) for icon chip backgrounds.
        brand: {
          50: "#E4F1F9", // Icon bg (spec)
          100: "#CFEAFF",
          200: "#9FD5FF",
          300: "#6FC0FF",
          400: "#45AEFF",
          500: "#1BA2FF", // Primary blue (spec)
          600: "#0F8DE0",
          700: "#0B70B3",
          800: "#085586",
          900: "#063D5F",
        },
        // Accent / success green (spec)
        accent: {
          DEFAULT: "#06E688",
          50: "#E3FDF3",
          400: "#06E688",
          500: "#05C476",
        },
        // Warm accent kept for pending/warning status only (not a core brand color)
        amber: {
          400: "#F5B93F",
          500: "#EFA613",
        },
        ink: {
          900: "#11223A", // Text primary (spec)
          700: "#35435C",
          500: "#717E95", // Text secondary (spec)
          400: "#98A2B5",
          300: "#BFC6D2",
        },
        surface: {
          DEFAULT: "#F3F6F7", // Background (spec)
          card: "#FFFFFF", // Surface (spec)
          alt: "#F3F7FD", // Surface alt (spec)
          border: "#E6EAF0", // Border (spec)
        },
        success: "#06B36A", // Positive (spec)
        danger: "#D73143", // Negative (spec)
      },
      fontFamily: {
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(13, 18, 38, 0.04), 0 8px 24px -12px rgba(13, 18, 38, 0.10)",
        panel: "0 20px 60px -20px rgba(5, 11, 31, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;