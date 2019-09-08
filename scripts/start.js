/**
 * start.js
 */
'use strict'
console.log('>>>>>>>>>>>start.js>>>>>>>>>>>>>>')
process.env.NODE_ENV = 'development'

process.on('unhandledRejection', err => {
    throw err
})

const verifyPkgDep = require('./utils/verifyPkgDep')

if (process.env.SKIP_PKGDEP_CHECK !== 'true') {
    verifyPkgDep()
}

const verifyTypeScript = require('./utils/verifyTypeScript')
verifyTypeScript()

const checkRequiredFiles = require('./utils/checkRequiredFiles')
const fs = require('fs')
const paths = require('../build/paths')
const webpack = require('webpack')
const isActive = process.stdout.isTTY

if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1)
}

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000
const HOST = process.env.HOST || '0.0.0.0'

const { checkBrowsers } = require('./utils/browserHelper')
const { choosePort } = require('./utils/webpackServerHelper')

checkBrowsers(paths.appPath, isActive).then(() => {
    return choosePort(HOST, DEFAULT_PORT)
})
