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
        softBg: '#eef2f6',
        softBgDark: '#e2e8f0',
        softTextPrimary: '#2d3748',
        softTextSecondary: '#718096',
        primaryBlue: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      boxShadow: {
        'soft-out': '6px 6px 16px #cbd5e1, -6px -6px 16px #ffffff',
        'soft-out-lg': '10px 10px 24px #cbd5e1, -10px -10px 24px #ffffff',
        'soft-in': 'inset 4px 4px 8px #cbd5e1, inset -4px -4px 8px #ffffff',
        'soft-btn': '4px 4px 10px #93c5fd, -4px -4px 10px #ffffff',
        'soft-blue-glow': '0 10px 20px -5px rgba(37, 99, 235, 0.4)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
};
