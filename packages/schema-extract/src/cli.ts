#!/usr/bin/env node

import {posix} from 'path';
import {inspect} from 'util';
import commander from 'commander';
import chalk from 'chalk';
import {LocalFileSystem} from 'kissfs';
import {extractSchema} from './extract-schema';

commander
  .version('0.1.0')
  .option('-f, --files <s>', 'files to scan')
  .option('-o, --output <s>', 'output dir')
  .parse(process.argv);

async function run() {
  const inputDir = process.cwd();
  const outputDir = commander.output as string;
  const sourcesGlob = commander.files as string;

  const fs = new LocalFileSystem(inputDir);
  for (const {file, schema} of extractSchema(inputDir, sourcesGlob)) {
    const relativePath = posix.relative(inputDir, file);
    if (outputDir) {
      const outputFilename = posix.join(outputDir, relativePath + '.json');
      await fs.saveFile(outputFilename, JSON.stringify(schema, null, 4));
    } else {
      process.stdout.write('\n');
      process.stdout.write('\n' + chalk.yellow(relativePath));
      process.stdout.write('\n' + inspect(schema, {depth: null, colors: true}));
    }
  }
}

run();
