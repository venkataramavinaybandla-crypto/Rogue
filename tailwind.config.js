/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0a0b',
        surface: {
          DEFAULT: '#0f0f11',
          panel: '#141416',
          raised: '#18181b',
        },
        border: 'rgba(255, 255, 255, 0.08)',
        'border-active': 'rgba(255, 255, 255, 0.18)',
        foreground: '#ededed',
        muted: '#8a8a8f',
        lime: {
          DEFAULT: '#c6ff3d',
          dark: '#a3d924',
          dim: 'rgba(198, 255, 61, 0.12)',
        },
        cyan: {
          DEFAULT: '#5ce1e6',
          dim: 'rgba(92, 225, 230, 0.12)',
        },
        pale: {
          DEFAULT: '#cfe8e4',
          foreground: '#0a0a0b',
        },
        severity: {
          info: '#5ce1e6',
          warn: '#ffb638',
          fail: '#ff4d4d',
        }
      },
      fontFamily: {
        sans: ['"Inter Tight"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        xs: '2px',
        sm: '3px',
        DEFAULT: '4px',
        md: '4px',
        lg: '6px',
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
      }
    },
  },
  plugins: [],
}

