/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink:   { DEFAULT: '#0D0D0D', 50: '#f5f5f5', 100: '#e8e8e8', 200: '#c4c4c4', 300: '#a0a0a0', 500: '#555', 700: '#222', 900: '#0D0D0D' },
        vote:  { DEFAULT: '#00C896', 50: '#e6faf5', 100: '#b3f0df', 500: '#00C896', 600: '#00a87e', 700: '#008a67' },
        alert: { DEFAULT: '#FF4D4F', 50: '#fff1f1', 500: '#FF4D4F', 600: '#e63e40' },
        gold:  { DEFAULT: '#F5A623', 50: '#fef8ec', 100: '#fdedc8', 500: '#F5A623', 700: '#c07d0f' },
        slate: { 50: '#f8f9fb', 100: '#f0f2f5', 200: '#e2e6ec', 300: '#cdd3dc', 400: '#9aa5b4', 500: '#677489', 600: '#4a5568', 700: '#2d3748', 800: '#1a202c', 900: '#0f1419' },
      },
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        lift:  '0 4px 24px rgba(0,0,0,0.12)',
        glow:  '0 0 0 3px rgba(0,200,150,0.25)',
        error: '0 0 0 3px rgba(255,77,79,0.2)',
      },
      borderRadius: {
        xl:    '1rem',
        '2xl': '1.25rem',
      },
      animation: {
        'fade-up':   'fadeUp 0.4s ease forwards',
        'fade-in':   'fadeIn 0.3s ease forwards',
        'pulse-dot': 'pulseDot 1.6s ease-in-out infinite',
        'slide-in':  'slideIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      keyframes: {
        fadeUp:   { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:   { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        pulseDot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
        slideIn:  { '0%': { opacity: 0, transform: 'translateX(-12px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
};