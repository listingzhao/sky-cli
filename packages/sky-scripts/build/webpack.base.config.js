const webpack = require('webpack')
const paths = require('./paths')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { resolve } = require('./utils')

const babelConfig = require('./getBabelConfig')(false)
const postcssConfig = require('./getPostcssConfig')

const svgRegex = /\.svg(\?v=\d+\.\d+\.\d+)?$/
const svgOptions = {
    limit: 10000,
    minetype: 'image/svg+xml',
}

const imageOptions = {
    limit: 10000,
}
const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

const getStylesLoader = (cssOptions, afterLoader) => {
    const loaders = [
        isDev && resolve('style-loader'),
        isProd && {
            loader: MiniCssExtractPlugin.loader,
            options: {},
        },
        {
            loader: 'css-loader',
            options: cssOptions,
        },
        {
            loader: 'postcss-loader',
            options: { ...postcssConfig, sourceMap: true },
        },
    ].filter(Boolean)

    if (afterLoader) {
        loaders.push({
            loader: require.resolve(afterLoader),
            options: {
                javascriptEnabled: true,
                sourceMap: true,
            },
        })
    }

    console.log(loaders)
    return loaders
}
console.log(isProd)
module.exports = {
    entry: paths.appIndexJs,
    output: {
        filename: 'app.js',
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx'],
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: resolve('babel-loader'),
                options: babelConfig,
            },
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: resolve('babel-loader'),
                        options: babelConfig,
                    },
                    {
                        loader: resolve('ts-loader'),
                        options: {
                            transpileOnly: true,
                            experimentalWatchApi: true,
                        },
                    },
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: getStylesLoader({ importLoaders: 1, sourceMap: true }),
                // https://github.com/webpack/webpack/issues/6571
                sideEffects: true,
            },
            {
                test: /\.less$/,
                use: getStylesLoader(
                    { importLoaders: 2, sourceMap: true },
                    'less-loader'
                ),
            },
            // image
            {
                test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
                loader: 'url-loader',
                options: imageOptions,
            },
            {
                test: svgRegex,
                loader: 'url-loader',
                options: svgOptions,
            },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            React: 'react',
        }),
        new HtmlWebpackPlugin({
            template: paths.appHtml,
        }),
    ],
}
