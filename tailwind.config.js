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
  DEFAULT: '#1e40af',  
  hover: '#1e3a8a',
  light: '#dbeafe',
  pale: '#eff6ff',
},
      },
    },
  },
  plugins: [],
}