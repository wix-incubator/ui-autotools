#!/usr/bin/env node
import {Command} from "commander";
import autoSSRTest from './auto-ssr/mocha-wrapper';
import importMeta from './auto-ssr/import-meta';
const program = new Command();

program
.command('sanity')
.description('run sanity checks on all components with a metadata description')
.option("-g, --grep <pattern>", "Grep file")
.action(function(options){
  const searchPattern = options.grep || '';
  // // const moreSearch = options.otherDirs || [];
  console.log('Running auto-ssr for', searchPattern);
  importMeta();
  autoSSRTest();
});

program.parse(process.argv);
