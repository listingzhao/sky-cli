const autoprefixer = require('autoprefixer')
const rucksack = require('rucksack-css')

module.exports = {
    plugins: [rucksack(), autoprefixer()],
}
