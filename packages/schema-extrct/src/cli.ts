#!/usr/bin/env node

import commander from 'commander'
import glob from 'glob'
import * as ts from 'typescript'
import {LocalFileSystem} from 'kissfs'
import * as path from 'path'
import { transform } from './file-transformer'
import { createHost } from './isomorphc-typescript-host'

const posix: typeof path.posix = path.posix ? path.posix : path
commander
  .version('0.1.0')
  .option('-f, --files <s>', 'files to scan')
  .option('-o, --output <s>', 'output dir')
  .parse(process.argv)

async function run() {
  const fs = new LocalFileSystem(process.cwd())

  const allFiles = glob.sync(commander.files)
  const host = createHost(fs)
  const program = ts.createProgram(allFiles, {}, host)
  const checker = program.getTypeChecker()
  for (const file of allFiles) {
      const source = program.getSourceFile(file)
      const res = transform(checker, source!, file, '')
      if (commander.output) {
        const target = posix.join(commander.output, file).slice(0, -1 * posix.extname(file).length) + '.json'

        await fs.saveFile(target, JSON.stringify(res, null, 4))
      }
  }
}

run()
