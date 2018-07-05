#!/usr/bin/env node
import {Command} from 'commander';
import ssrTest from './ssr-test/mocha-wrapper';
import {eyesTest} from 'ui-autotools-eyes';
import importMeta from './import-metadata/import-meta';
import {a11yTest} from 'a11y';
import glob from 'glob';
import path from 'path';

const program = new Command();
const packagePath = __dirname;
const defaultMetaGlob = 'src/**/*.meta.ts?(x)';

program
.command('sanity')
.description('run sanity checks on all components with a metadata description')
.option('-f, --files [pattern]', 'Grep file')
.action((options) => {
  const searchString = arguments.length === 1 ? '' : options.files;
  // Load metadata for each component that should be sanity tested
  importMeta(searchString);
  // Run the sanity tests for each loaded metadata
  ssrTest();
});

program
.command('a11y')
.description('test')
.option('-f, --files [pattern]', 'Grep file')
.option('-i, --impact <i>', 'Only display issues with impact level higher than <i>. Value between 1 (minor) and 4 (critical)')
.action((options) => {
  const entry = glob.sync(path.join(packagePath, options.files ? options.files : defaultMetaGlob));
  const impact = Number(options.impact);
  const impactLevel = (isNaN(impact) || impact > 4 || impact < 1) ? 1 : impact;
  a11yTest(entry, impactLevel);
});

program
.command('eyes')
.description('compare components to the expected appearance using Eyes')
.action(eyesTest);

program.parse(process.argv);
