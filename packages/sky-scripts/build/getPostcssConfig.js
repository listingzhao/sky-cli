const autoprefixer = require('autoprefixer');
const rucksack = require('rucksack-css');

module.exports = {
  ident: 'postcss',
  plugins: [rucksack(), autoprefixer()],
};
