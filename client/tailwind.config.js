/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D4AF37', // Light Golden
        secondary: '#FFD700', // Bright Gold
        accent: '#C5A572', // Muted Gold
        dark: {
          DEFAULT: '#0A0A0A', // Pure Black
          100: '#1A1A1A', // Very Dark Gray
          200: '#2A2A2A', // Dark Gray
          300: '#3A3A3A', // Medium Dark Gray
        },
        gold: {
          50: '#FFFEF7',
          100: '#FFF9E6',
          200: '#FFF3CC',
          300: '#FFECB3',
          400: '#FFE699',
          500: '#D4AF37', // Primary Gold
          600: '#C5A572',
          700: '#B8935F',
          800: '#9A7B4F',
          900: '#7D6340',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
        'gradient-gold-dark': 'linear-gradient(135deg, #D4AF37 0%, #0A0A0A 100%)',
      },
    },
  },
  plugins: [],
}
