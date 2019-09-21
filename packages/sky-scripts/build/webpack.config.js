const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.config');
const devConfig = require('./webpack.dev.config');
const proConfig = require('./webpack.pro.config');

module.exports = env => {
  const isDevelopment = env === 'development';
  const isProduction = env === 'production';
  let config = isDevelopment ? devConfig : proConfig;
  return merge(baseConfig, config);
};
