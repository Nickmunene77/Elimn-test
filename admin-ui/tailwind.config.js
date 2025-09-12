// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#f9fafb', // light gray
        foreground: '#111827', // dark gray/black
        primary: {
          DEFAULT: '#2563eb', // blue-600
          foreground: '#ffffff', // white text on primary
        },
        secondary: {
          DEFAULT: '#e5e7eb', // gray-200
          foreground: '#111827', // dark gray text
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#111827',
        },
        border: '#e5e7eb', // gray-200
        input: '#d1d5db', // gray-300
        ring: '#2563eb', // blue-600
      },
    },
  },
  plugins: [],
};
