/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'game-primary': '#6d28d9',
        'game-secondary': '#4c1d95',
      },
    },
  },
  plugins: [],
}
