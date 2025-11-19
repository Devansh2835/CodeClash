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
        primary: {
          400: '#1ab1ff',
          500: '#00d9ff',
          600: '#00b8e6',
          700: '#009fcc',
        },
        success: {
          400: '#1aff8e',
          500: '#00ff88',
          600: '#00e676',
          700: '#00cc61',
        },
        danger: {
          400: '#ff1a54',
          500: '#ff3366',
          600: '#e62e5c',
          700: '#cc2952',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};