const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
    ],
}
