'use strict'

const path = require('path')
const fs = require('fs')
const semver = require('semver')
const chalk = require('chalk')

function verifyPkgDep() {
    const depsCheck = ['webpack', 'webpack-dev-server', 'babel-loader']
    // semver-regex https://github.com/sindresorhus/semver-regex/blob/master/index.js MIT
    const getSemverRegex = () =>
        /(?<=^v?|\sv?)(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:[1-9]\d*|[\da-z-]*[a-z-][\da-z-]*)(?:\.(?:[1-9]\d*|[\da-z-]*[a-z-][\da-z-]*))*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?(?=$|\s)/gi
    const pkgJson = require('../../package.json')
    const expectedVersionDep = {}
    depsCheck.forEach(dep => {
        const expectedVersion = pkgJson.dependencies[dep]
        if (!expectedVersion) {
            throw new Error('This dependency list is outdated, fix it.')
        }
        if (!getSemverRegex().test(expectedVersion)) {
            throw new Error(
                `The ${dep} package should be pinned, instead got version ${expectedVersion}.`
            )
        }
        expectedVersionDep[dep] = expectedVersion
    })

    let currentDir = __dirname
    while (true) {
        const prevDir = currentDir
        currentDir = path.resolve(currentDir, '..')
        if (currentDir === prevDir) {
            break
        }

        const nodeModules = path.resolve(currentDir, 'node_modules')
        if (!fs.existsSync(nodeModules)) {
            continue
        }
        depsCheck.forEach(dep => {
            const moduleDep = path.resolve(nodeModules, dep)
            if (!fs.existsSync(moduleDep)) {
                return
            }
            const modulePkgJson = path.resolve(moduleDep, 'package.json')
            if (!fs.existsSync(modulePkgJson)) {
                return
            }
            const moduleJsonData = JSON.parse(
                fs.readFileSync(modulePkgJson, 'utf-8')
            )
            const expectedVersion = expectedVersionDep[dep]
            if (!semver.satisfies(moduleJsonData.version, expectedVersion)) {
                console.error(
                    chalk.red(
                        `\nThere might be a problem with the project dependency tree.\n` +
                            `It is likely ${chalk.bold(
                                'not'
                            )} a bug in sky-cli, but something you need to fix locally. \n\n`
                    ) +
                        `The ${chalk.bold(
                            pkgJson.name
                        )} package provided by sky-cli requires a dependency:\n\n` +
                        chalk.green(
                            `"${chalk.bold(dep)}": "${chalk.bold(
                                expectedVersion
                            )}"\n\n`
                        ) +
                        `Don't try to install it manually: your package manager does it automatically.\n` +
                        `However, a different version of ${chalk.bold(
                            dep
                        )} was detected higher up in the tree:\n\n` +
                        `${chalk.bold(
                            chalk.red(moduleDep)
                        )} (version: ${chalk.bold(
                            chalk.red(moduleJsonData.version)
                        )}) \n\n` +
                        `Manually installing incompatible versions is known to cause hard-to-debug issues.\n\n` +
                        chalk.red(
                            `If you would prefer to ignore this check, add ${chalk.bold(
                                'SKIP_PKGDEP_CHECK=true'
                            )} to an ${chalk.bold(
                                '.env'
                            )} file in your project.\n` +
                                `That will permanently disable this message but you might encounter other issues.\n\n`
                        ) +
                        `To ${chalk.green(
                            'fix'
                        )} the dependency tree, try following the steps below in the exact order:\n\n` +
                        `  ${chalk.cyan('1.')} Delete ${chalk.bold(
                            'package-lock.json'
                        )} (${chalk.underline('not')} ${chalk.bold(
                            'package.json'
                        )}!) and/or ${chalk.bold(
                            'yarn.lock'
                        )} in your project folder.\n` +
                        `  ${chalk.cyan('2.')} Delete ${chalk.bold(
                            'node_modules'
                        )} in your project folder.\n` +
                        `  ${chalk.cyan('3.')} Remove "${chalk.bold(
                            dep
                        )}" from ${chalk.bold(
                            'dependencies'
                        )} and/or ${chalk.bold(
                            'devDependencies'
                        )} in the ${chalk.bold(
                            'package.json'
                        )} file in your project folder.\n` +
                        `  ${chalk.cyan('4.')} Run ${chalk.bold(
                            'npm install'
                        )} or ${chalk.bold(
                            'yarn'
                        )}, depending on the package manager you use.\n\n` +
                        `In most cases, this should be enough to fix the problem.\n` +
                        `If this has not helped, there are a few other things you can try:\n\n` +
                        `  ${chalk.cyan('5.')} If you used ${chalk.bold(
                            'npm'
                        )}, install ${chalk.bold(
                            'yarn'
                        )} (http://yarnpkg.com/) and repeat the above steps with it instead.\n` +
                        `     This may help because npm has known issues with package hoisting which may get resolved in future versions.\n\n` +
                        `  ${chalk.cyan('6.')} Check if ${chalk.bold(
                            moduleDep
                        )} is outside your project directory.\n` +
                        `     For example, you might have accidentally installed something in your home folder.\n\n` +
                        `  ${chalk.cyan('7.')} Try running ${chalk.bold(
                            `npm ls ${dep}`
                        )} in your project folder.\n` +
                        `     This will tell you which ${chalk.underline(
                            'other'
                        )} package (apart from the expected ${chalk.bold(
                            pkgJson.name
                        )}) installed ${chalk.bold(dep)}.\n\n` +
                        `If nothing else helps, add ${chalk.bold(
                            'SKIP_PREFLIGHT_CHECK=true'
                        )} to an ${chalk.bold(
                            '.env'
                        )} file in your project.\n` +
                        `That would permanently disable this preflight check in case you want to proceed anyway.\n\n` +
                        chalk.cyan(
                            `P.S. We know this message is long but please read the steps above :-) We hope you find them helpful!\n`
                        )
                )
                process.exit(1)
            }
        })
    }
}

module.exports = verifyPkgDep
