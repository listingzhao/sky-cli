/**
 * 检测ts是否安装
 */
const fs = require('fs');
const chalk = require('chalk');
const globby = require('sky-tools/globby');
const os = require('os');
const path = require('path');
const resolve = require('resolve');
const produce = require('sky-tools/immer').produce;
const paths = require('../../build/paths');

function writeJson(fileName, object) {
  fs.writeFileSync(
    fileName,
    JSON.stringify(object, null, 2).replace(/\n/g, os.EOL) + os.EOL
  );
}

function verifyNoTypeScript() {
  const files = globby.sync(
    ['**/*.(ts|tsx)', '!**/node_modules', '!**/*.d.ts'],
    {
      cwd: paths.appSrc,
    }
  );
  if (files.length > 0) {
    console.warn(
      chalk.yellow(
        `We detected TypeScript in your project (${chalk.bold(
          `src${path.sep}${files[0]}`
        )}) and created a ${chalk.bold('tsconfig.json')} file for you.`
      )
    );
    return false;
  }
  return true;
}

function verifyTypeScriptSetup() {
  let firstSetup = false;
  if (!fs.existsSync(paths.appTsConfig)) {
    if (verifyNoTypeScript()) {
      return;
    }
    writeJson(paths.appTsConfig, {});
    firstSetup = true;
  }

  const isYarn = fs.existsSync(paths.yarnLockFile);

  // 确保安装ts
  let ts;
  try {
    ts = require(resolve.sync('typescript', {
      basedir: paths.appNodeModules,
    }));
  } catch (_) {
    console.error(
      `It look like you're trying to use TypeScript but not have ${chalk.bold(
        'typescript'
      )} installed.`
    );
    console.error(
      `Please install ${chalk.cyan.bold(
        'typescript'
      )} by running ${chalk.cyan.bold(
        isYarn ? 'yarn add typescript' : 'npm install typescript'
      )}.`
    );
    console.error(
      chalk.bold(
        'If you are not trying to use TypeScript, please remove the ' +
          chalk.cyan('tsconfig.json') +
          ' file from your package root (and any TypeScript files).'
      )
    );
    process.exit(1);
  }

  const compilerOptions = {
    // suggested
    target: {
      parsedValue: ts.ScriptTarget.ES5,
      suggested: 'es5',
    },
    // required
    module: {
      parsedValue: ts.ModuleKind.ESNext,
      value: 'esnext',
      reason: 'for import() and import/export',
    },
    moduleResolution: {
      parsedValue: ts.ModuleResolutionKind.NodeJs,
      value: 'node',
      reason: 'to match webpack resolution',
    },
    resolveJsonModule: { value: true, reason: 'to match webpack loader' },
    isolatedModules: { value: true, reason: 'implementation limitation' },
    noEmit: { value: true },
    jsx: {
      parsedValue: ts.JsxEmit.React,
      suggested: 'react',
    },
    paths: {
      value: undefined,
      reason: 'aliased imports are not supported',
    },
  };

  const formatHost = {
    getCanonicalFileName: path => path,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => os.EOL,
  };

  const messages = [];
  let appTsConfig;
  let parsedTsConfig;
  let parsedCompilerOptions;
  try {
    // console.log(ts.sys)
    const { config: readTsConfig, error } = ts.readConfigFile(
      paths.appTsConfig,
      ts.sys.readFile
    );
    if (error) {
      throw new Error(ts.formatDiagnostic(error, formatHost));
    }
    appTsConfig = readTsConfig;

    let result;
    parsedTsConfig = produce(readTsConfig, config => {
      result = ts.parseJsonConfigFileContent(
        config,
        ts.sys,
        path.dirname(paths.appTsConfig)
      );
    });

    if (result.errors && result.errors.length) {
      throw new Error(ts.formatDiagnostic(errors[0], formatHost));
    }
    parsedCompilerOptions = result.options;
  } catch (e) {
    if (e && e.name === 'SyntaxError') {
      console.error(
        chalk.red.bold(
          `Could not parse ${chalk.cyan('tsconfig.json')} .` +
            `Please make sure it contains syntactically correct JSON.`
        )
      );
    }
    console.log(e && e.message ? `${e.message}` : '');
    process.exit(1);
  }

  if (appTsConfig.compilerOptions == null) {
    appTsConfig.compilerOptions = {};
    firstTimeSetup = true;
  }

  for (const option of Object.keys(compilerOptions)) {
    const { parsedValue, value, suggested, reason } = compilerOptions[option];
    // console.log(reason)
    const checkValue = parsedValue === undefined ? value : parsedValue;
    const colorOutPutOptions = chalk.cyan('compilerOptions.' + option);

    if (suggested != null) {
      if (parsedCompilerOptions[option] == undefined) {
        appTsConfig.compilerOptions[option] = suggested;
        messages.push(
          `${colorOutPutOptions} to be ${chalk.bold(
            'suggested'
          )} value: ${chalk.cyan.bold(suggested)} this can be changed`
        );
      }
    } else if (parsedCompilerOptions[option] !== checkValue) {
      appTsConfig.compilerOptions[option] = value;
      messages.push(
        `${colorOutPutOptions} ${chalk.bold(
          checkValue == null ? 'must be' : 'must'
        )} be ${checkValue == null ? 'set' : chalk.cyan.bold(value)}` +
          (reason != null ? `(${reason})` : '')
      );
    }
  }

  // merged include exclude
  if (parsedTsConfig.include == null) {
    appTsConfig.include = ['src'];
    messages.push(
      `${chalk.cyan('include')} should be ${chalk.cyan.bold('src')}`
    );
  }

  if (messages.length > 0) {
    if (firstSetup) {
      console.log(
        chalk.bold(
          `Your ${chalk.cyan(
            'tsconfig.json'
          )} has been populated with default values.`
        )
      );
    } else {
      console.warn(
        chalk.bold(
          `The folloing changes are being made to your ${chalk.cyan(
            'tsconfig.json'
          )} file:`
        )
      );

      messages.forEach(msg => {
        console.warn('-' + msg);
      });
    }
    writeJson(paths.appTsConfig, appTsConfig);
  }
}

module.exports = verifyTypeScriptSetup;
