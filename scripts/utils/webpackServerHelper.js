const detect = require('detect-port-alt')
const isRoot = require('is-root')
const clearConsole = require('./clearConsole')
const isActive = process.stdout.isTTY

function choosePort(host, defaultPort) {
    return detect(defaultPort, host).then(
        port =>
            new Promise(resolve => {
                console.log(port === defaultPort)
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

module.exports = {
    choosePort,
}
