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
                    targets: {
                        browsers: [
                            'last 2 versions',
                            'Firefox ESR',
                            '> 1%',
                            'ie >= 9',
                            'iOS >= 8',
                            'Android >= 4',
                        ],
                    },
                },
            ],
        ],
        plugins,
    }
}
