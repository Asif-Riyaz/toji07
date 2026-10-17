/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0F172A',
        },
        emerald: {
          600: '#059669',
        },
        amber: {
          600: '#D97706',
        },
        coral: {
          600: '#DC2626',
        },
        slate: {
          50: '#F8FAFC',
        },
      },
    },
  },
  plugins: [],
}
