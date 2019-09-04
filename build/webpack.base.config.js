const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { resolve } = require('./utils')

const babelConfig = require('./getBabelConfig')(false)
const postcssConfig = require('./getPostcssConfig')

module.exports = {
    entry: './src/index.tsx',
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
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: Object.assign({}, postcssConfig, { sourceMap: true }),
                    }
                ],
            },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            React: 'react',
        }),
        new HtmlWebpackPlugin({
            template: './src/tpl/index.html',
        }),
    ],
}
