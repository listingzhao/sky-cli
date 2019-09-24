/**
 * start.js
 */
'use strict';
process.env.NODE_ENV = 'development';

process.on('unhandledRejection', err => {
  throw err;
});

const verifyPkgDep = require('./utils/verifyPkgDep');

if (process.env.SKIP_PKGDEP_CHECK !== 'true') {
  verifyPkgDep();
}

const verifyTypeScript = require('./utils/verifyTypeScript');
verifyTypeScript();

const checkRequiredFiles = require('sky-tools/checkRequiredFiles');
const fs = require('fs');
const chalk = require('chalk');
const paths = require('../build/paths');
const webpackConfig = require('../build/webpack.config');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const clearConsole = require('sky-tools/clearConsole');
const isActive = process.stdout.isTTY;

if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const { checkBrowsers } = require('sky-tools/browserHelper');
const openBrowser = require('sky-tools/openBrowser');
const {
  choosePort,
  createCompiler,
  createProxy,
  preParseUrls,
} = require('sky-tools/webpackServerHelper');
const createDevServerConfig = require('../build/webpackDevServer.config');

checkBrowsers(paths.appPath, isActive)
  .then(() => {
    return choosePort(HOST, DEFAULT_PORT);
  })
  .then(port => {
    if (port == null) {
      return;
    }
    const config = webpackConfig('development');
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
    const appName = require(paths.pkgJson).name;
    const useTypeScript = fs.existsSync(paths.appTsConfig);
    const urls = preParseUrls(protocol, HOST, port);

    const compiler = createCompiler({
      config,
      appName,
      protocol,
      urls,
      useTypeScript,
      webpack,
    });

    const proxySetting = require(paths.pkgJson).proxy;
    const proxyConfig = createProxy(proxySetting, paths.appPublic);
    const devServerConfig = createDevServerConfig(
      proxyConfig,
      urls.urlForConfig
    );
    const devServer = new webpackDevServer(compiler, devServerConfig);
    devServer.listen(port, HOST, err => {
      if (err) {
        console.log(err);
        return;
      }
      //   if (isActive) {
      //     clearConsole();
      //   }
      console.log(chalk.cyan('Starting the develoment server. \n'));
      openBrowser(urls.localUrlForBoswer);
    });

    Array.from(['SIGINT', 'SIGTERM']).forEach(sig => {
      process.on(sig, () => {
        console.log('Control-C 退出');
        devServer.close();
        process.exit(1);
      });
    });
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
