/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#0B0F19",
          card: "#111827",
          border: "#1F2937",
          primary: "#6366F1", // Indigo
          secondary: "#06B6D4", // Cyan
          accent: "#EC4899", // Pink
          success: "#10B981" // Emerald
        }
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'slide-up': 'slide-up 0.4s ease-out forwards'
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)' },
          '50%': { opacity: 0.6, boxShadow: '0 0 5px rgba(99, 102, 241, 0.1)' }
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        'slide-up': {
          '0%': { transform: 'translateY(15px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        }
      }
    },
  },
  plugins: [],
}
