#!/usr/bin/env node
require('dotenv').config();
import {registerRequireHooks} from '@ui-autotools/utils';
import {Command} from 'commander';
import ssrTest from './ssr-test/mocha-wrapper';
import {hydrationTest} from '@ui-autotools/sanity';
import {eyesTest} from '@ui-autotools/eyes';
import importMeta from './import-metadata/import-meta';
import {a11yTest, impactLevels} from '@ui-autotools/a11y';
import glob from 'glob';
import path from 'path';

registerRequireHooks();

const program = new Command();
const projectPath = process.cwd();
const defaultMetaGlob = 'src/**/*.meta.ts?(x)';

program
.command('sanity')
.description('run sanity checks on all components with a metadata description')
.option('-f, --files [pattern]', 'Grep file')
.action((options) => {
  const entry = path.join(projectPath, options.files ? options.files : defaultMetaGlob);
  // Load metadata for each component that should be sanity tested
  importMeta(entry);
  // Run the sanity tests for each loaded metadata
  ssrTest();
  hydrationTest(entry);
});

program
.command('a11y')
.description('run accessibility tests on components with metadata files that match the given pattern')
.option('-f, --files [pattern]', 'metadata file pattern')
.option('-i, --impact <i>', `Only display issues with impact level <i> and higher. Values are: ${impactLevels.join(', ')}`)
.action((options) => {
  const entry = glob.sync(path.join(projectPath, options.files ? options.files : defaultMetaGlob));
  const impact = options.impact || 'minor';
  if (!impactLevels.includes(impact)) {
    throw new Error(`Invalid impact level ${impact}`);
  }
  a11yTest(entry, impact);
});

program
.command('eyes')
.description('compare components to the expected appearance using Eyes')
.option('-f, --files [pattern]', 'metadata file pattern')
.action((options) => {
  const entry = glob.sync(path.join(projectPath, options.files ? options.files : defaultMetaGlob));

  eyesTest(entry, process.env.EYES_API_KEY);
});

program.parse(process.argv);
