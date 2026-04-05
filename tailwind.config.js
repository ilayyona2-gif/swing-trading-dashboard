/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      colors: {
        base:    '#06090e',
        card:    '#0b1220',
        hover:   '#0f1b2d',
        line:    '#1a2e47',
        dim:     '#0d1d30',
        t1:      '#dce9f8',
        t2:      '#627b96',
        t3:      '#2d4255',
        up:      '#00c896',
        down:    '#ff3358',
        warn:    '#f5a623',
        accent:  '#2d7eff',
        cyan:    '#00d4e8',
      },
      fontSize: {
        '2xs': ['10px', '14px'],
      },
    },
  },
  plugins: [],
}
