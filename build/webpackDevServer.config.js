'use strict'
const paths = require('./paths')
const { ignoredFiles } = require('./utils')

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http'
const host = process.env.HOST || '0.0.0.0'

module.exports = function(proxy, allowedHost) {
    return {
        compress: true,
        clientLogLevel: 'none', // 关闭log
        contentBase: paths.appPublic,
        watchContentBase: true, // 页面重载
        hot: true,
        public: allowedHost,
        publicPath: '/',
        quiet: true,
        overlay: false,
        watchOptions: {
            ignored: ignoredFiles(paths.appSrc),
        },
        https: protocol === 'https',
        host,
        proxy,
        before(app, server) {},
    }
}
