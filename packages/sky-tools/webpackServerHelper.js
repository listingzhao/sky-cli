const detect = require('detect-port-alt');
const chalk = require('chalk');
const url = require('url');
const fs = require('fs');
const address = require('address');
const isRoot = require('is-root');
const clearConsole = require('./clearConsole');
const fomatWebpackMsgs = require('./fomatWebpackMsgs');
const typescriptFomatter = require('./typescriptFomatter');
const forkTsCheckerWebpackPlugin = require('./ForkTsCheckerWebpackPlugin');
const isActive = process.stdout.isTTY;

function preParseUrls(protocol, host, port) {
  const formatUrl = hostname =>
    url.format({
      protocol,
      hostname,
      port,
      pathname: '/',
    });
  const printUrl = hostname =>
    url.format({
      protocol,
      hostname,
      port: chalk.bold(port),
      pathname: '/',
    });
  const isUnspecifiedHost = host === '0.0.0.0' || host === '::';
  let prettyHost, urlForConfig, urlForTerminal;
  if (isUnspecifiedHost) {
    prettyHost = 'localhost';
    try {
      urlForConfig = address.ip();
      if (urlForConfig) {
        if (
          /^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(
            urlForConfig
          )
        ) {
          urlForTerminal = printUrl(urlForConfig);
        }
      } else {
        urlForConfig = undefined;
      }
    } catch (error) {}
  } else {
    prettyHost = host;
  }

  const localUrlForTerminal = printUrl(prettyHost);
  const localUrlForBoswer = formatUrl(prettyHost);

  return {
    urlForConfig,
    urlForTerminal,
    localUrlForTerminal,
    localUrlForBoswer,
  };
}

function choosePort(host, defaultPort) {
  return detect(defaultPort, host).then(
    port =>
      new Promise(resolve => {
        if (port === defaultPort) {
          return resolve(port);
        }

        const message =
          process.platform !== 'win32' && defaultPort < 1024 && !isRoot()
            ? 'Admin permissions are required to run a server on port below 1024.'
            : `Somthing is already running on port ${defaultPort}`;
        if (isActive) {
          clearConsole();
        }
      })
  );
}

function createCompiler({ config, appName, urls, useTypeScript, webpack }) {
  let compiler;
  try {
    compiler = webpack(config);
  } catch (error) {
    console.log(chalk.red('Failed to compile.'));
    console.log(error.message || error);
    process.exit(1);
  }

  compiler.hooks.invalid.tap('invalid', () => {
    if (isActive) {
      clearConsole();
    }
    console.log('Compiling...');
  });

  let isFirstCompiler = true;
  let tsMessagePromise;
  let tsMessageResolver;

  if (useTypeScript) {
    compiler.hooks.beforeCompile.tap('beforeCompile', () => {
      tsMessagePromise = new Promise(resolve => {
        tsMessageResolver = msgs => resolve(msgs);
      });
    });

    forkTsCheckerWebpackPlugin
      .getCompilerHooks(compiler)
      .receive.tap('afterTypeScriptCheck', (diagnostics, lint) => {
        const allMsgs = [...diagnostics, ...lint];
        const format = message =>
          `${message.file}\n ${typescriptFomatter(message, true)}`;

        tsMessageResolver({
          errors: allMsgs.filter(msg => msg.severity === 'error').map(format),
          warnings: allMsgs
            .filter(msg => msg.severity === 'warning')
            .map(format),
        });
      });
  }

  compiler.hooks.done.tap('done', async stats => {
    // if (isActive) {
    //   clearConsole();
    // }
    const statsData = stats.toJson({
      all: false,
      warnings: true,
      errors: true,
    });

    if (useTypeScript) {
      const message = await tsMessagePromise;
      statsData.errors.push(...message.errors);
      statsData.warnings.push(...message.warnings);
      if (isActive) {
        clearConsole();
      }
    }

    const webpackMsg = fomatWebpackMsgs(statsData);
    const isSuccess = !webpackMsg.errors.length && !webpackMsg.warnings.length;
    if (isSuccess) {
      console.log(chalk.green('Compiled successfully!'));
    }

    if (isSuccess && isFirstCompiler) {
      pringtIntroductions(appName, urls);
    }
    isFirstCompiler = false;

    if (webpackMsg.errors.length) {
      console.log(chalk.red('Failed to compile.\n'));
      return;
    }
  });

  return compiler;
}

function pringtIntroductions(appName, urls) {
  console.log(`You can now view ${chalk.bold(appName)} in the browser.`);
  if (urls.urlForTerminal) {
    console.log(`Local: ${urls.localUrlForTerminal}`);
    console.log(`Network: ${urls.urlForTerminal}`);
  } else {
    console.log(`${urls.localUrlForTerminal}`);
  }
  console.log();
  console.log('Note that the development build is not optimized.');
  console.log();
}

function createProxy(proxy, appPublic) {
  if (!proxy) {
    return undefined;
  }

  function mayProxy(pathName) {
    const mayPublicPath = path.resolve(appPublic, pathName.slice(1));
    const isPublicFileReq = fs.existsSync(mayPublicPath);
    return !isPublicFileReq;
  }

  let target;
  if (process.platform === 'win32') {
    target = resolveLoop(proxy);
  } else {
    target = proxy;
  }

  return [
    {
      context: (pathName, req) => {
        return (
          req.method !== 'GET' ||
          (mayProxy(pathName) &&
            req.headers.accept &&
            req.headers.accept.indexOf('text/html') === -1)
        );
      },
      target,
      logLevel: 'silent',
      onProxyReq: proxyReq => {
        if (proxyReq.getHeader('origin')) {
          proxyReq.setHeader('origin', target);
        }
      },
      secure: false,
      changeOrigin: true,
      ws: true,
      xfwd: true,
    },
  ];
}

function resolveLoop(proxy) {
  const obj = url.parse(proxy);
  obj.host = undefined;
  if (obj.hostname !== 'localhost') {
    return proxy;
  }

  try {
    if (!address.ip()) {
      obj.hostname = '127.0.0.1';
    }
  } catch (error) {
    obj.hostname = '127.0.0.1';
  }

  return url.format(obj);
}

module.exports = {
  choosePort,
  createCompiler,
  createProxy,
  preParseUrls,
};
