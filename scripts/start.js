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
