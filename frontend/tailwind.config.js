/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'border': 'var(--border-color)',
        'accent': 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'card-bg': 'var(--card-bg)',
      },
    },
  },
  plugins: [],
}
