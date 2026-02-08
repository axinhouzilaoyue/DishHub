/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          light: '#FBFAF8', // 全局底色 - 特种纸
          DEFAULT: '#F2F0ED', // 层级色 - 亚麻灰
          stone: '#EAE8E4',  // 深色石材
        },
        sage: {
          DEFAULT: '#5E6754', // 鼠尾草绿 - 主色
          light: '#8FA382',
          dark: '#4A5243',
        },
        cinnamon: {
          DEFAULT: '#8C7365', // 肉桂褐 - 点缀
          light: '#B09A8F',
        },
        ink: {
          DEFAULT: '#2D2D2D', // 木炭墨灰 - 标题
          light: '#6B6B6B',
        }
      },
      boxShadow: {
        'paper': '0 2px 8px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'paper-deep': '0 10px 30px rgba(0, 0, 0, 0.04), 0 4px 8px rgba(0, 0, 0, 0.02)',
      },
      letterSpacing: {
        'tightest': '-0.04em',
      }
    },
  },
  plugins: [],
}
