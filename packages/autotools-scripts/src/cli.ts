#!/usr/bin/env node
import {Command} from "commander";
import autoSSRTest from './auto-ssr/mocha-wrapper';
import importMeta from './import-metadata/import-meta';
const program = new Command();

program
.command('sanity')
.description('run sanity checks on all components with a metadata description')
.option("-f, --files [pattern]", "Grep file")
.action(function(options){
  const searchString = arguments.length === 1 ? '' : options;
  console.log('Running auto-ssr for', searchString);
  // Load metadata for each component that should be sanity tested
  importMeta(searchString);
  // Run the sanity tests for each loaded metadata
  autoSSRTest();
});

program.parse(process.argv);
