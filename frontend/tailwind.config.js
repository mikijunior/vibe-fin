/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background layers
        bg: {
          base: '#0d1117',
          panel: '#1a1a2e',
          elev: '#232342',
        },
        // Accents per SPEC.md §2
        accent: {
          yellow: '#ecad0a',
          blue: '#209dd7',
          purple: '#753991',
        },
        // Muted palette for borders/separators
        muted: {
          DEFAULT: '#3a3f4b',
          strong: '#2d3340',
          subtle: '#1f242e',
        },
        // Direction colors for tick flashes
        tick: {
          up: '#16a34a',
          down: '#dc2626',
        },
        ink: {
          DEFAULT: '#e6edf3',
          dim: '#8b949e',
          faint: '#5f6671',
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      animation: {
        'flash-up': 'flash-up 500ms ease-out',
        'flash-down': 'flash-down 500ms ease-out',
        'pulse-dot': 'pulse-dot 1.4s ease-in-out infinite',
      },
      keyframes: {
        'flash-up': {
          '0%': { backgroundColor: 'rgba(22, 163, 74, 0.45)' },
          '100%': { backgroundColor: 'transparent' },
        },
        'flash-down': {
          '0%': { backgroundColor: 'rgba(220, 38, 38, 0.45)' },
          '100%': { backgroundColor: 'transparent' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
};
