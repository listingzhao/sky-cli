const webpack = require('webpack')
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
                        options: { ...postcssConfig, sourceMap: true },
                    },
                ],
            },
            {
                test: /\.less$/,
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
                        options: { ...postcssConfig, sourceMap: true },
                    },
                    {
                        loader: 'less-loader',
                        options: { javascriptEnabled: true, sourceMap: true },
                    },
                ],
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
            template: './src/tpl/index.html',
        }),
    ],
}
