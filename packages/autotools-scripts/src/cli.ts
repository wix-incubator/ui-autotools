#!/usr/bin/env node
import {Command} from 'commander';
import ssrTest from './ssr-test/mocha-wrapper';
import importMeta from './import-metadata/import-meta';
import {a11yTest} from 'a11y';
const program = new Command();

program
.command('sanity')
.description('run sanity checks on all components with a metadata description')
.option('-f, --files [pattern]', 'Grep file')
.action((options) => {
  const searchString = arguments.length === 1 ? '' : options;
  // Load metadata for each component that should be sanity tested
  importMeta(searchString);
  // Run the sanity tests for each loaded metadata
  ssrTest();
  a11yTest();
});

program.parse(process.argv);
