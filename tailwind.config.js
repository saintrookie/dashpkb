import tailwindcssAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#050f2e',
          900: '#08153d',
          800: '#0b1c4a',
          700: '#0e2358',
        },
        brand: {
          blue: '#1668e3',
          blueLight: '#3b82f6',
        },
        surface: {
          canvas: '#eef2f9',
          card: '#ffffff',
          border: '#e3e9f5',
        },
        status: {
          green: '#16a34a',
          greenBg: '#e9f9ef',
          yellow: '#eab308',
          yellowBg: '#fef9e7',
          orange: '#f2760c',
          orangeBg: '#fdeee1',
          red: '#e0332f',
          redBg: '#fdecec',
          purple: '#7c3aed',
          purpleBg: '#f1e9fe',
          cyan: '#0aa6a6',
          cyanBg: '#e3f7f6',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 30, 70, 0.04), 0 2px 8px rgba(16, 30, 70, 0.06)',
        sidebarActive: '0 4px 14px rgba(22, 104, 227, 0.45)',
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
