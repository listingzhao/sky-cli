'use strict'

const execSync = require('child_process').execSync
const open = require('open')

const OSX_CHROME = 'google chrome'

const Actions = Object.freeze({
    NONE: 0,
    BROWSER: 1,
})

function getBrowserEnv() {
    const value = process.env.BROWSER
    const args = process.env.BROWSER_ARGS
        ? process.env.BROWSER_ARGS.split(' ')
        : []
    let action
    if (!value) {
        action = Actions.BROWSER
    } else if (value.toLowerCase() == 'none') {
        action = Actions.NONE
    } else {
        action = Actions.BROWSER
    }
    return { action, value, args }
}

function startBrowserProcess(bo, url, args) {
    console.log('browser:', bo)
    console.log('platform:', process.platform)
    const tryOpenChromeAppleScript =
        process.platform === 'darwin' &&
        (typeof bo !== 'string' || bo === OSX_CHROME)
    console.log(tryOpenChromeAppleScript)
    if (tryOpenChromeAppleScript) {
        try {
            execSync('ps cax | grep "Google Chrome"')
            execSync(
                'osascript openChrome.applescript "' + encodeURI(url) + '"',
                {
                    cwd: __dirname,
                    stdio: 'ignore',
                }
            )
            return true
        } catch (error) {
            console.log(error)
        }
    }

    if (process.platform === 'darwin' && bo === 'open') {
        bo = undefined
    }

    if (typeof bo === 'string' && args.length > 0) {
        bo = [bo].concat(args)
    }

    try {
        let options = { app: bo, wait: false }
        open(url, options).catch(err => {
            console.log(err)
        })
        return true
    } catch (error) {
        return false
    }
}

function openBrowser(url) {
    const { action, value, args } = getBrowserEnv()
    switch (action) {
        case Actions.NONE:
            return false
        case Actions.BROWSER:
            return startBrowserProcess(value, url, args)
        default:
            throw new Error('No action')
    }
}

module.exports = openBrowser
