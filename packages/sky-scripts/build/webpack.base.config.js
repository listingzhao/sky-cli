const fs = require('fs');
const webpack = require('webpack');
const paths = require('./paths');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const getCssModuleLocalIdent = require('sky-tools/getCssModuleLocalIdent');
const ForkTsCheckerWebpackPlugin = require('sky-tools/ForkTsCheckerWebpackPlugin');
const { resolve } = require('./utils');

const babelConfig = require('./getBabelConfig')(false);
const postcssConfig = require('./getPostcssConfig');
const useTypeScript = fs.existsSync(paths.appTsConfig);

const svgRegex = /\.svg(\?v=\d+\.\d+\.\d+)?$/;
const svgOptions = {
  limit: 10000,
  minetype: 'image/svg+xml',
};

const imageOptions = {
  limit: 10000,
};
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';
const publicPath = isDev ? '/' : paths.appTsConfig;

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
  ].filter(Boolean);

  if (afterLoader) {
    loaders.push({
      loader: require.resolve(afterLoader),
      options: {
        javascriptEnabled: true,
        sourceMap: true,
      },
    });
  }

  return loaders;
};

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
        exclude: /\.m.css$/,
        use: getStylesLoader({ importLoaders: 1, sourceMap: true }),
        // https://github.com/webpack/webpack/issues/6571
        sideEffects: true,
      },
      {
        test: /\.m.css$/,
        use: getStylesLoader({
          importLoaders: 1,
          sourceMap: true,
          modules: {
            getLocalIdent: getCssModuleLocalIdent,
          },
        }),
      },
      {
        test: /\.less$/,
        exclude: /\.m.less$/,
        use: getStylesLoader(
          { importLoaders: 2, sourceMap: true },
          'less-loader'
        ),
        // https://github.com/webpack/webpack/issues/6571
        sideEffects: true,
      },
      {
        test: /\.m.less$/,
        use: getStylesLoader(
          {
            importLoaders: 2,
            sourceMap: true,
            modules: {
              getLocalIdent: getCssModuleLocalIdent,
            },
          },
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
    new ManifestPlugin({
      publicPath: publicPath,
      generate: (seed, files, entrypoints) => {
        const manifestFiles = files.reduce((manifest, file) => {
          manifest[file.name] = file.path;
          return manifest;
        }, seed);
        const entrypointFiles = entrypoints.main.filter(
          fileName => !fileName.endsWith('.map')
        );

        return {
          files: manifestFiles,
          entrypoints: entrypointFiles,
        };
      },
    }),
    useTypeScript &&
      new ForkTsCheckerWebpackPlugin({
        tsconfig: paths.appTsConfig,
        async: isDev,
        useTypescriptIncrementalApi: true,
        checkSyntacticErrors: true,
        silent: true,
      }),
  ],
};
