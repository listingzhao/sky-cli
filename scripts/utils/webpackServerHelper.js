const detect = require('detect-port-alt')
const chalk = require('chalk')
const url = require('url')
const address = require('address')
const webpack = require('webpack')
const isRoot = require('is-root')
const clearConsole = require('./clearConsole')
const fomatWebpackMsgs = require('./fomatWebpackMsgs')
const isActive = process.stdout.isTTY

function preParseUrls(protocol, host, port) {
    const formatUrl = hostname =>
        url.format({
            protocol,
            hostname,
            port,
            pathname: '/',
        })
    const printUrl = hostname =>
        url.format({
            protocol,
            hostname,
            port: chalk.bold(port),
            pathname: '/',
        })
    const isUnspecifiedHost = host === '0.0.0.0' || host === '::'
    let prettyHost, urlForConfig, urlForTerminal
    if (isUnspecifiedHost) {
        prettyHost = 'localhost'
        try {
            urlForConfig = address.ip()
            if (urlForConfig) {
                if (
                    /^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(
                        urlForConfig
                    )
                ) {
                    urlForTerminal = printUrl(urlForConfig)
                }
            } else {
                urlForConfig = undefined
            }
        } catch (error) {}
    } else {
        prettyHost = host
    }

    const localUrlForTerminal = printUrl(prettyHost)
    const localUrlForBoswer = formatUrl(prettyHost)

    return {
        urlForConfig,
        urlForTerminal,
        localUrlForTerminal,
        localUrlForBoswer,
    }
}

function choosePort(host, defaultPort) {
    return detect(defaultPort, host).then(
        port =>
            new Promise(resolve => {
                if (port === defaultPort) {
                    return resolve(port)
                }

                const message =
                    process.platform !== 'win32' &&
                    defaultPort < 1024 &&
                    !isRoot()
                        ? 'Admin permissions are required to run a server on port below 1024.'
                        : `Somthing is already running on port ${defaultPort}`
                if (isActive) {
                    clearConsole()
                }
            })
    )
}

function createCompiler({ config, appName }) {
    let compiler
    try {
        compiler = webpack(config)
    } catch (error) {
        console.log(chalk.red('Failed to compile.'))
        console.log(error.message || error)
        process.exit(1)
    }
    // console.log(compiler.hooks)
    compiler.hooks.invalid.tap('invalid', () => {
        if (isActive) {
            clearConsole()
        }
        console.log('Compiling...')
    })

    compiler.hooks.done.tap('done', async stats => {
        if (isActive) {
            clearConsole()
        }
        // console.log(stats)
        const statsData = stats.toJson({
            all: false,
            warnings: true,
            errors: true,
        })
        console.log(statsData)
        const webpackMsg = fomatWebpackMsgs(statsData)
        const isSuccess =
            !webpackMsg.errors.length && !webpackMsg.warnings.length
        if (isSuccess) {
            console.log(chalk.green('Compiled successfully!'))
        }
    })

    return compiler
}

function createProxy(proxy, appPublic) {
    if (!proxy) {
        return undefined
    }

    let target
    if (process.platform === 'win32') {
        target = resolveLoop(proxy)
    } else {
        target = proxy
    }

    return [
        {
            target,
            logLevel: 'silent',
            onProxyReq: proxyReq => {
                if (proxyReq.getHeader('origin')) {
                    proxyReq.setHeader('origin', target)
                }
            },
            secure: false,
            changeOrigin: true,
            ws: true,
            xfwd: true,
        },
    ]
}

function resolveLoop(proxy) {
    const obj = url.parse(proxy)
    obj.host = undefined
    if (obj.hostname !== 'localhost') {
        return proxy
    }

    try {
        if (!address.ip()) {
            obj.hostname = '127.0.0.1'
        }
    } catch (error) {
        obj.hostname = '127.0.0.1'
    }

    return url.format(obj)
}

module.exports = {
    choosePort,
    createCompiler,
    createProxy,
    preParseUrls,
}
