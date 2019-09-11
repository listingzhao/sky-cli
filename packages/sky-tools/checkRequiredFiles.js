'use strict'

const path = require('path')
const fs = require('fs')
const chalk = require('chalk')

function checkRequiredFiles(files = []) {
    let currentFilePath
    try {
        files.forEach(filePath => {
            currentFilePath = filePath
            fs.accessSync(currentFilePath, fs.constants.F_OK)
        })
        return true
    } catch (error) {
        let dirname = path.dirname(currentFilePath)
        let filename = path.basename(currentFilePath)
        console.log(
            chalk.red('Could not find a required file.') +
                `\n ${chalk.red('Name:')}${chalk.cyan(filename)} \n` +
                `Searched in ${chalk.cyan(dirname)}`
        )
        return false
    }
}

module.exports = checkRequiredFiles
