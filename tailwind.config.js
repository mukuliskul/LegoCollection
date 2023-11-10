/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [`./public/**/*.ejs`],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],

  daisyui: {
    themes: ['fantasy', 'cupcake'],
  }
}

