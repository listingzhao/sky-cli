'use strict';

const browserslist = require('browserslist');
const chalk = require('chalk');
const inquirer = require('inquirer');
const pkgUp = require('pkg-up');
const fs = require('fs');
const os = require('os');

const defaultBrowsers = [
  'last 2 versions',
  'Firefox ESR',
  '> 1%',
  'ie >= 9',
  'iOS >= 8',
  'Android >= 4',
];

function shouldSetBrowsers(active) {
  if (!active) {
    Promise.resolve(true);
  }

  const modal = {
    type: 'confirm',
    name: 'shouldSetBrowsers',
    message: chalk.yellow(
      `We're unable to detect target browsers. \n\n` +
        `Would you like to add the defaults to your ${chalk.bold(
          'package.json'
        )} ?`
    ),
    default: true,
  };

  return inquirer.prompt(modal).then(answer => answer.shouldSetBrowsers);
}

function checkBrowsers(dir, active, retry = true) {
  const current = browserslist.findConfig(dir);

  if (current != null) {
    return Promise.resolve(current);
  }

  if (!retry) {
    return Promise.reject(
      new Error(
        `Please add a ${chalk.underline(
          'browserslist'
        )} key to your ${chalk.bold('package.json')} .`
      )
    );
  }

  return shouldSetBrowsers(active).then(shouldSetBrowsers => {
    console.log(shouldSetBrowsers);
    if (!shouldSetBrowsers) {
      return checkBrowsers(dir, active, false);
    }

    return pkgUp(dir)
      .then(path => {
        if (path == null) {
          return Promise.reject();
        }

        const pkg = JSON.parse(fs.readFileSync(path));
        pkg['browserslist'] = defaultBrowsers;
        fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + os.EOL);
        browserslist.clearCaches();
        console.log(
          `${chalk.green('Set target browsers:')} ${chalk.cyan(
            defaultBrowsers.join(', ')
          )}`
        );
      })
      .catch(() => {})
      .then(() => checkBrowsers(dir, active, false));
  });
}

module.exports = { checkBrowsers, defaultBrowsers };
