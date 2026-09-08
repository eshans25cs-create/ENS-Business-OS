/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ens-navy': '#030B1A',
        'ens-dark': '#060F20',
        'ens-blue': '#0A84FF',
        'ens-blue-glow': '#3BA0FF',
        'ens-gold': '#FFD700',
        'ens-emerald': '#00C896',
        'ens-red': '#FF3B5C',
        'ens-text': '#F0F4FF',
        'ens-muted': '#6B7FA3',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'particle-drift': 'particleDrift 15s linear infinite',
        'spin-slow': 'spin 20s linear infinite',
        'gradient-shift': 'gradientShift 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(10, 132, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(10, 132, 255, 0.6), 0 0 80px rgba(10, 132, 255, 0.2)' },
        },
        particleDrift: {
          '0%': { transform: 'translateY(100vh) translateX(0)' },
          '100%': { transform: 'translateY(-100px) translateX(100px)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
