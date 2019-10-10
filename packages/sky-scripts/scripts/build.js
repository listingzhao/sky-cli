'use strict';

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

const fs = require('fs-extra');
const path = require('path');
const filesize = require('filesize');
const stripAnsi = require('strip-ansi');
const chalk = require('sky-tools/chalk');
const webpack = require('webpack');
const { checkBrowsers } = require('sky-tools/browserHelper');
const fomatWebpackMsgs = require('sky-tools/fomatWebpackMsgs');
const recursive = require('recursive-readdir');
const gzipSize = require('gzip-size').sync;
const paths = require('../build/paths');
const webpackConfig = require('../build/webpack.config');

function canReadFile(asset) {
  return /\.(js|css)$/.test(asset);
}
function copyPulicFiles() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
}

/**
 * 获取就文件大小信息
 * @param {*} buildPath
 */
function fileSizeBeforeBuild(buildPath) {
  return new Promise(resolve => {
    recursive(buildPath, (err, fileNames) => {
      let sizes = {};
      if (!err && Array.from(fileNames).length > 0) {
        sizes = fileNames.filter(canReadFile).reduce((memo, fileName) => {
          let content = fs.readFileSync(fileName);
          let key = removeFileHash(buildPath, fileName);
          memo[key] = gzipSize(content);
          return memo;
        }, {});
      }

      resolve({
        root: buildPath,
        sizes,
      });
    });
  });
}

/**
 * 去除hash
 * @param {*} buildPath
 * @param {*} fileName
 */
function removeFileHash(buildPath, fileName) {
  return fileName
    .replace(buildPath, '')
    .replace(/\\/g, '/')
    .replace(
      /\/?(.*)(\.[0-9a-f]+)(\.chunk)?(\.js|\.css)/,
      (match, p1, p2, p3, p4) => p1 + p4
    );
}

const isActive = process.stdout.isTTY;
checkBrowsers(paths.appPath, isActive)
  .then(() => {
    return fileSizeBeforeBuild(paths.appBuild);
  })
  .then(oldFiles => {
    // 清空目录
    fs.emptyDirSync(paths.appBuild);
    // copy public
    copyPulicFiles();
    return build(oldFiles);
  })
  .then(({ stats, oldFiles, messages }) => {
    if (messages.warnings.length) {
      console.log(chalk.yellow('Compiled with warnings.\n'));
      console.log(messages.warnings.join('\n\n'));
    } else {
      console.log(chalk.green('Compiled successfully.\n'));
    }

    console.log(`File sizes after gzip.\n`);
    printFileSizes(stats, oldFiles, paths.appBuild);
  });

function printFileSizes(webpackStats, oldFiles, buildPath) {
  let root = oldFiles.root;
  let sizes = oldFiles.sizes;
  let assets = (webpackStats.stats || [webpackStats])
    .map(stats =>
      stats
        .toJson({ all: false, assets: true })
        .assets.filter(asset => canReadFile(asset.name))
        .map(asset => {
          const fileContent = fs.readFileSync(`${root}/${asset.name}`);
          const size = gzipSize(fileContent);
          const preFileSize = size[removeFileHash(root, asset.name)];
          const diff = getDifferenceLabel(size, preFileSize);
          return {
            folder: path.join(
              path.basename(buildPath),
              path.dirname(asset.name)
            ),
            name: asset.name,
            size: size,
            sizeLabel: `${filesize(size)}${diff ? diff : ''}`,
          };
        })
    )
    .reduce((sign, all) => {
      return all.concat(sign);
    }, []);
  assets.sort((a, b) => b.size - a.size);

  let longSizeLabelLength = Math.max.apply(
    null,
    assets.map(a => stripAnsi(a.sizeLabel).length)
  );
  let bundleSplitting = false;
  assets.forEach(asset => {
    let assetSizeLabel = asset.sizeLabel;
    let sizeLength = stripAnsi(assetSizeLabel).length;
    if (sizeLength < longSizeLabelLength) {
      let rightPadding = ' '.repeat(longSizeLabelLength - sizeLength);
      assetSizeLabel += rightPadding;
    }
    let isMainBundle = asset.name.indexOf('main.') === 0;
    const maxRecommendedSize = isMainBundle ? 512 * 1024 : 1024 * 1024;
    let isLarge = maxRecommendedSize && asset.size > maxRecommendedSize;
    if (isLarge && path.extname(asset.name) === '.js') {
      bundleSplitting = true;
    }

    console.log(
      '  ' +
        (isLarge ? chalk.yellow(assetSizeLabel) : assetSizeLabel) +
        '  ' +
        chalk.dim(asset.folder + path.sep) +
        chalk.green(asset.name)
    );
  });
}

/**
 *  构造大小label
 * @param {*} currentSize
 * @param {*} preSize
 */
function getDifferenceLabel(currentSize, preSize) {
  const FIFTY_KILOBYTES = 1024 * 50;
  const diff = currentSize - preSize;
  const fileSize = !Number.isNaN(diff) ? filesize(diff) : 0;
  if (diff > FIFTY_KILOBYTES) {
    return chalk.red('+' + fileSize);
  } else if (diff < FIFTY_KILOBYTES && diff > 0) {
    return chalk.yellow('+' + fileSize);
  } else if (diff < 0) {
    return chalk.green(fileSize);
  } else {
    return '';
  }
}

function build(oldFiles) {
  console.log('Creating an optimized production build...');

  const config = webpackConfig('production');
  const compiler = webpack(config);
  return new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      let messages;
      if (error) {
        return reject(error);
      } else {
        console.log(stats.toJson({ all: false, warnings: true, errors: true }));
        messages = fomatWebpackMsgs(
          stats.toJson({ all: false, warnings: true, errors: true })
        );
      }

      return resolve({
        stats,
        oldFiles,
        messages,
      });
    });
  });
}
