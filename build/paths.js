'use strict'

const path = require('path')
const fs = require('fs')

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = realPath => path.resolve(appDirectory, realPath)

const moduleExtensions = ['js', 'jsx', 'ts', 'tsx']
const resolveModules = (resolveFn, path) => {
    const extens = moduleExtensions.find(extension =>
        fs.existsSync(resolveFn(`${path}.${extension}`))
    )

    if (extens) {
        return resolveFn(`${path}.${extens}`)
    }

    return resolveFn(`${path}.js`)
}

module.exports = {
    appPath: resolveApp('.'),
    appPublic: resolveApp('public'),
    appHtml: resolveApp('public/index.html'),
    appIndexJs: resolveModules(resolveApp, 'src/index'),
    appSrc: resolveApp('src'),
    appTsConfig: resolveApp('tsconfig.json'),
    pkgJson: resolveApp('package.json'),
    appNodeModules: resolveApp('node_modules'),
    yarnLockFile: resolveApp('yarn.lock'),
}
