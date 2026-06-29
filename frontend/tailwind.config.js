/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // SPEC §2: dark theme, backgrounds #0d1117 / #1a1a2e, accent #ecad0a,
        // primary #209dd7, secondary #753991, muted gray borders.
        bg: {
          primary: "#0d1117",
          secondary: "#1a1a2e",
          elevated: "#161b22",
        },
        accent: {
          DEFAULT: "#ecad0a",
          muted: "#a88508",
        },
        brand: {
          primary: "#209dd7",
          secondary: "#753991",
        },
        border: {
          DEFAULT: "#30363d",
          muted: "#21262d",
        },
        flash: {
          up: "#1f8a3a",
          down: "#b62324",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
      },
      keyframes: {
        flashUp: {
          "0%": { backgroundColor: "rgba(31, 138, 58, 0.45)" },
          "100%": { backgroundColor: "rgba(31, 138, 58, 0)" },
        },
        flashDown: {
          "0%": { backgroundColor: "rgba(182, 35, 36, 0.45)" },
          "100%": { backgroundColor: "rgba(182, 35, 36, 0)" },
        },
      },
      animation: {
        "flash-up": "flashUp 500ms ease-out",
        "flash-down": "flashDown 500ms ease-out",
      },
    },
  },
  plugins: [],
};