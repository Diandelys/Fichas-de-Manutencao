/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#1B4F8A',
          100: '#D5E3F4',
        },
        neutral: {
          900: '#0F0E0D',
          600: '#6B6965',
          200: '#E5E7EB',
          100: '#F2F1EE',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
