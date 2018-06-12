#!/usr/bin/env node

import commander from 'commander';
import glob from 'glob';
import * as ts from 'typescript';
import * as fs from 'fs';
import { transform } from './file-transformer';
commander
  .version('0.1.0')
  .option('-f, --files <s>', 'files to scan')
  .option('-o, --output <s>', 'output dir')
  .parse(process.argv);

  

const allFiles = glob.sync(commander.files);
 const program = ts.createProgram(allFiles,{});
const checker = program.getTypeChecker();
for(let file of allFiles){
    const source = program.getSourceFile(file); 
    const res = transform(checker,source!, file);
    debugger;
    console.log(res);
    if(commander.output){
      fs.writeFileSync(commander.output,JSON.stringify(res, null, 4))
    }
}