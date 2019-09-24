'use strict';

const chalk = require('chalk');
const codeFrame = require('@babel/code-frame').codeFrameColumns;
const fs = require('fs');
const os = require('os');

const types = { diagnostic: 'TypeScript', lint: 'TSLint' };

function fomatter(message, useColors) {
  console.log(message);
  const { type, file, severity, content, character } =
    typeof message.getFile() === 'function'
      ? {
          type: message.getType(),
          file: message.getFile(),
          severity: message.getSeverity(),
          content: message.getContent(),
          character: message.getCharacter(),
        }
      : message;
  const colors = new chalk.constructor({ enabled: useColors });
  const messageColor = message.isWarningSeverity() ? colors.yellow : colors.red;
  const source = file && fs.existsSync(file) && fs.readFileSync(file, 'utf-8');
  const frame = source
    ? codeFrame(
        source,
        { start: { line: line, column: character } },
        { highlightCode: useColors }
      )
        .split('\n')
        .map(str => '  ' + str)
        .join(os.EOL)
    : '';
  return [
    messageColor.bold(`${types[type]} ${severity.toLowerCase()} in`) +
      `${file}(${line},${character}` +
      content,
    frame,
  ].join(os.EOL);
}

module.exports = fomatter;
