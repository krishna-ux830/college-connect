/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
        },
        secondary: {
          DEFAULT: '#6b7280',
          hover: '#4b5563',
        },
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        background: '#f9fafb',
        card: '#ffffff',
        text: {
          primary: '#111827',
          secondary: '#4b5563',
          muted: '#6b7280',
        },
        border: '#e5e7eb',
        faculty: {
          highlight: '#8b5cf6',
          'highlight-light': 'rgba(139, 92, 246, 0.1)',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Open Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'card': '0.5rem',
      },
    },
  },
  plugins: [],
};
