import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'text-primary': 'var(--text-primary)',
        gold: 'var(--gold)',
        'gold-light': 'var(--gold-light)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-dark': 'var(--bg-dark)',
        success: 'var(--success)',
        error: 'var(--error)',
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-10vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        'confetti-fall': 'confetti-fall 3s ease-out forwards',
      }
    },
  },
  plugins: [],
};
export default config;
