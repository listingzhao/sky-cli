'use strict'
const chalk = require('chalk')
const syntaxError = 'Syntax error:'

function isLikeASyntaxError(msg) {
    return msg.indexOf(syntaxError) !== -1
}

function fomatMsg(msg) {
    let lines = msg.split('\n')
    // https://github.com/webpack/webpack/blob/master/lib/ModuleError.js
    lines = lines.filter(line => !/Module [A-z]+\(from/.test(line))

    msg = lines.join('\n')
    msg = msg.replace(
        /SyntaxError\s+\((\d+):(\d+)\)\s*(.+?)\n/g,
        `${syntaxError} $3 ($1:$2)\n`
    )

    msg = msg.replace(/Line (\d+):\d+:/g, 'Line $1:')

    lines = msg.split('\n')

    // console.log(lines[0])
    // lines[0] = lines[0].replace(/^(.*) \d+:\d+-\d+$/, '$1')
    // console.log('>>>>>>>>>>>>>.')
    // console.log(lines[0])
    lines[0] = chalk.inverse(lines[0])

    msg = lines.join('\n')
    console.log(msg)
    return msg.trim()
}

function fomatWebpackMsgs(jsonData) {
    const fomatErrs = jsonData.errors.map(msg => fomatMsg(msg))
    const fomatWarns = jsonData.warnings.map(msg => fomatMsg(msg))
    const result = { errors: fomatErrs, warnings: fomatWarns }
    if (result.errors.some(isLikeASyntaxError)) {
        result.errors = result.errors.filter(isLikeASyntaxError)
    }
    return result
}

module.exports = fomatWebpackMsgs
