'use strict';

const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = realPath => path.resolve(appDirectory, realPath);

const moduleExtensions = ['js', 'jsx', 'ts', 'tsx'];
const resolveModules = (resolveFn, path) => {
  const extens = moduleExtensions.find(extension =>
    fs.existsSync(resolveFn(`${path}.${extension}`))
  );

  if (extens) {
    return resolveFn(`${path}.${extens}`);
  }

  return resolveFn(`${path}.js`);
};

module.exports = {
  appPath: resolveApp('.'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveModules(resolveApp, 'src/index'),
  appSrc: resolveApp('src'),
  appTsConfig: resolveApp('tsconfig.json'),
  pkgJson: resolveApp('package.json'),
  appNodeModules: resolveApp('node_modules'),
  yarnLockFile: resolveApp('yarn.lock'),
};

const resolveOwn = relativePath => path.resolve(__dirname, '..', relativePath);

if (__dirname.indexOf(path.join('packages', 'sky-scripts', 'build')) !== -1) {
  module.exports = {
    appPath: resolveOwn('.'),
    appPublic: resolveOwn('demo/public'),
    appHtml: resolveOwn('demo/public/index.html'),
    appIndexJs: resolveModules(resolveOwn, 'demo/src/index'),
    appSrc: resolveOwn('demo/src'),
    appTsConfig: resolveOwn('demo/tsconfig.json'),
    pkgJson: resolveOwn('package.json'),
    appNodeModules: resolveOwn('node_modules'),
    yarnLockFile: resolveOwn('demo/yarn.lock'),
  };
}
