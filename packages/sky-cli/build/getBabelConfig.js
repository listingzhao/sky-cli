const { resolve } = require('./utils')
module.exports = function(modules) {
    const plugins = [
        [
            resolve('@babel/plugin-transform-typescript'),
            {
                isTSX: true,
            },
        ],
        resolve('babel-plugin-inline-import-data-uri'),
    ]

    return {
        presets: [
            resolve('@babel/preset-react'),
            [
                resolve('@babel/preset-env'),
                {
                    modules,
                },
            ],
        ],
        plugins,
    }
}
