'use strict';

console.log('build.js');

process.env.NODE_ENV = 'production';

process.on('unhandledRejection', err => {
  throw err;
});

const verifyPkgDep = require('./utils/verifyPkgDep');

if (process.env.SKIP_PKGDEP_CHECK !== 'true') {
  verifyPkgDep();
}

const verifyTypeScript = require('./utils/verifyTypeScript');
verifyTypeScript();

const paths = require('../build/paths');
const fs = require('fs');
const { checkBrowsers } = require('sky-tools/browserHelper');

const recursive = require('recursive-readdir');
const gzipSize = require('gzip-size').sync;
function canReadFile(asset) {
  return /\.(js|css)$/.test(asset);
}
function fileSizeBeforeBuild(buildPath) {
  return new Promise(resolve => {
    recursive(buildPath, (err, fileNames) => {
      let sizes = {};
      console.log(fileNames);
      if (fileNames) {
        sizes = fileNames.filter(canReadFile).reduce((memo, fileName) => {
          let content = fs.readFileSync(fileName);
          let key = removeFileHash(buildPath, fileName);
          memo[key] = gzipSize(key);
          return memo;
        });
      }
      resolve({
        root: buildPath,
        sizes,
      });
    });
  });
}

const isActive = process.stdout.isTTY;
checkBrowsers(paths.appPath, isActive).then(() => {
  return fileSizeBeforeBuild(paths.appBuild);
});
