#!/usr/bin/env node
'use strict';
process.on('unhandledRejection', err => {
  throw err;
});

const spawn = require('sky-tools/crossSpawn');
const args = process.argv.slice(2);

const scriptIndex = args.findIndex(
  x => x === 'build' || x === 'start' || x === 'test'
);

const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];
switch (script) {
  case 'build':
  case 'start':
  case 'test':
    const result = spawn.sync(
      'node',
      nodeArgs.concat(
        require
          .resolve('../scripts/' + script)
          .concat(args.slice(scriptIndex + 1))
      ),
      { stdio: 'inherit' }
    );
    process.exit(result.status);
    break;
  default:
    console.log('Unknow script "' + script + '"');
    break;
}
