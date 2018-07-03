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
});

program
.command('a11y')
.description('test')
.option('-p, --path <p>', 'project path')
.option('-i, --impact <i>', 'Only display issues with impact level higher than <i>. Value between 1 (minor) and 4 (critical)')
.action((options) => {
  const impact = Number(options.impact);
  const impactLevel = (isNaN(impact) || impact > 4 || impact < 1) ? 1 : impact;
  const path = options.path ? options.path : './';
  a11yTest(path, impactLevel);
});

program.parse(process.argv);
