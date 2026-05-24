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
        primary: '#081F8C',
        secondary: '#00A651',
        accent: '#FF9800',
        brandOrange: '#FF9800',
        brandPink: '#FF007F',
        brandPurple: '#6A11CB',
        navy: '#050B2B',
        academic: '#F8FAFC',
        ink: '#334155',
        muted: '#64748B',
        dark: {
          DEFAULT: '#050B2B',
          100: '#0A1438',
          200: '#111D4A',
          300: '#1A2860',
        },
        gold: {
          50: '#FFFEF7',
          100: '#FFF9E6',
          200: '#FFF3CC',
          300: '#FFECB3',
          400: '#FFE699',
          500: '#D4AF37',
          600: '#C5A572',
          700: '#B8935F',
          800: '#9A7B4F',
          900: '#7D6340',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'brand-gradient': 'linear-gradient(135deg, #081F8C 0%, #00A651 100%)',
        'accent-gradient': 'linear-gradient(135deg, #6A11CB 0%, #FF007F 100%)',
        'soft-gradient': 'linear-gradient(135deg, #F8FAFC 0%, #EEF4FF 50%, #F4FFF8 100%)',
        'navy-gradient': 'linear-gradient(180deg, #050B2B 0%, #081F8C 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
        'gradient-dark': 'linear-gradient(135deg, #050B2B 0%, #0A1438 100%)',
      },
      boxShadow: {
        premium: '0 25px 50px -12px rgba(8, 31, 140, 0.25)',
        glow: '0 0 40px rgba(0, 166, 81, 0.35)',
      },
    },
  },
  plugins: [],
}
