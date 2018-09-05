#!/usr/bin/env node
import path from 'path';
import glob from 'glob';
import dotenv from 'dotenv';
import {Command} from 'commander';
import {hydrationTest} from '@ui-autotools/sanity';
import {eyesTest} from '@ui-autotools/snap';
import {a11yTest, impactLevels} from '@ui-autotools/a11y';
import {buildWebsite, startWebsite} from '@ui-autotools/showcase';
import ssrTest from './ssr-test/mocha-wrapper';
import {importMeta} from '@ui-autotools/registry';

dotenv.config();

const program = new Command();
const projectPath = process.cwd();
const defaultMetaGlob = 'src/**/*.meta.ts?(x)';
const webpackConfigPath = path.join(projectPath, '.autotools/webpack.config.js');

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
  console.log('here');
  hydrationTest(entry, webpackConfigPath);
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
  a11yTest(entry, impact, webpackConfigPath);
});

program
.command('snap')
.description('compare components to the expected appearance using Applitools Eyes')
.option('-f, --files [pattern]', 'metadata file pattern')
.action(() => {
  eyesTest(projectPath);
});

program.command('showcase')
.description('create a website that shows component APIs and demos')
.option('-f, --files [pattern]', 'metadata file pattern')
.option('--output [dir]', 'output folder for the generated website')
.action((options) => {
  const outputPath: string | null = options.output ?
    path.join(projectPath, options.output) : null;

  const metadataGlob: string = options.files || defaultMetaGlob;

  const projectOptions = {
    projectPath,
    sourcesGlob: 'src/**/*.ts?(x)',
    metadataGlob,
    webpackConfigPath
  };

  if (outputPath) {
    buildWebsite({
      projectOptions,
      outputPath
    });
  } else {
    startWebsite({
      projectOptions,
      host: 'localhost',
      port: 8888
    });
  }
});

program.parse(process.argv);
