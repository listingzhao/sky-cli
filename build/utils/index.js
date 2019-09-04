const path = require('path')
const cwd = process.cwd()

function resolve(moduleName) {
    return require.resolve(moduleName)
}

function getProjectPath(...filePath) {
    return path.join(cwd, ...filePath)
}

module.exports = {
    resolve,
    getProjectPath,
}
