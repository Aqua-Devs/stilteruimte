/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF7F2',
        sage: '#9CA896',
        'deep-sage': '#6B7964',
        'warm-gray': '#5C5552',
        'soft-black': '#2B2826',
        clay: '#C9B5A0',
        mist: '#E8E4DE',
        accent: '#B89F91',
      },
      fontFamily: {
        serif: ['Crimson Pro', 'serif'],
        sans: ['Newsreader', 'serif'],
      },
    },
  },
  plugins: [],
}
