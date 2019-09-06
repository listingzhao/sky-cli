'use strict'

const path = require('path')
const fs = require('fs')

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = realPath => path.resolve(appDirectory, realPath)

module.exports = {
    appSrc: resolveApp('src'),
    appTsConfig: resolveApp('tsconfig.json'),
    appNodeModules: resolveApp('node_modules'),
    yarnLockFile: resolveApp('yarn.lock'),
}
