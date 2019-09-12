const path = require('path')
const escape = require('escape-string-regexp')
const cwd = process.cwd()

function resolve(moduleName) {
    return require.resolve(moduleName)
}

function getProjectPath(...filePath) {
    return path.join(cwd, ...filePath)
}

function ignoredFiles(srcPath) {
    console.log(srcPath)
    return new RegExp(
        `^(?!${escape(
            path.normalize(srcPath + '/').replace(/[\\]+/g, '/')
        )}).+/node_modules/`,
        'g'
    )
}

module.exports = {
    resolve,
    getProjectPath,
    ignoredFiles,
}
