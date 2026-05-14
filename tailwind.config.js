/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0f172a',
          2: '#1e293b',
          3: '#475569',
          4: '#94a3b8',
          5: '#cbd5e1',
        },
        accent: {
          DEFAULT: '#1C6AE4',
          hover: '#1555C8',
          light: '#D9E6FF',
          pale: '#EFF6FF',
        },
      },
    },
  },
  plugins: [],
}