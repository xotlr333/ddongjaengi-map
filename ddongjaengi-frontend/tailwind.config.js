/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1B64DA',
        'primary-surface': '#EBF1FD',
        bg: '#F2F4F6',
        surface: '#FFFFFF',
        'text-primary': '#191F28',
        'text-sub': '#8B95A1',
        border: '#E5E8EB',
        danger: '#F04452',
        kakao: '#FEE500',
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
