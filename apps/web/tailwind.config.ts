import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          500: '#4F6EF7',
          600: '#3B55E6',
          700: '#2940CC',
        },
        dark: {
          900: '#0F0F13',
          800: '#1A1A23',
          700: '#242432',
          600: '#2E2E40',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-in':  'fadeIn 0.15s ease-out',
        'bounce-in': 'bounceIn 0.3s ease-out',
      },
      keyframes: {
        slideIn:  { from: { transform: 'translateY(10px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        bounceIn: { '0%': { transform: 'scale(0.8)', opacity: '0' }, '70%': { transform: 'scale(1.05)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      }
    },
  },
  plugins: [],
}

export default config
