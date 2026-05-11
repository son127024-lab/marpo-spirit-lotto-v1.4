import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'marpo-bg': '#050505',    // 베이스 블랙
        'marpo-amber': '#f39c12',  // 전술 앰버 (Gold Rush)
        'marpo-neon': '#a3e235',   // 형광 그린 (Energy/Minting)
        'marpo-zinc': '#1a1a1b',   // UI 프레임워크 징크
      },
      fontFamily: {
        urbanist: ['Urbanist', 'sans-serif'],
      },
      animation: {
        'infinite-blink': 'neon-blink 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'neon-blink': {
          '0%, 100%': { opacity: '1', textShadow: '0 0 15px rgba(163,230,53,1)' },
          '50%': { opacity: '0.1' },
        }
      }
    },
  },
  plugins: [],
};
export default config;