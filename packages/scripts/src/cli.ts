#!/usr/bin/env node
import path from 'path';
import glob from 'glob';
import dotenv from 'dotenv';
import { Command } from 'commander';
import { hydrationTest } from '@ui-autotools/sanity';
import { a11yTest, impactLevels } from '@ui-autotools/a11y';
import { buildWebsite, startWebsite } from '@ui-autotools/showcase';
import ssrTest from './ssr-test/mocha-wrapper';
import { importMetaFiles } from './import-meta-files';
import { registerRequireHooks } from '@ui-autotools/node-utils';

const projectPath = process.cwd();
dotenv.config();
registerRequireHooks(projectPath);

const program = new Command();
const defaultMetaGlob = 'src/**/*.meta.ts?(x)';
const webpackConfigPath = path.join(projectPath, '.autotools/webpack.config.js');

program
  .command('sanity')
  .description('run sanity checks on all components with a metadata description')
  .option('-f, --files [pattern]', 'Grep file')
  .action((options) => {
    const metaGlob: string = options.files || defaultMetaGlob;
    importMetaFiles(projectPath, metaGlob);
    ssrTest();
    hydrationTest(projectPath, metaGlob, webpackConfigPath);
  });

program
  .command('a11y')
  .description('run accessibility tests on components with metadata files that match the given pattern')
  .option('-f, --files [pattern]', 'metadata file pattern')
  .option(
    '-i, --impact <i>',
    `Only display issues with impact level <i> and higher. Values are: ${impactLevels.join(', ')}`
  )
  .action((options) => {
    const entry = glob.sync(path.join(projectPath, options.files ? options.files : defaultMetaGlob));
    const impact = options.impact || 'minor';
    if (!impactLevels.includes(impact)) {
      throw new Error(`Invalid impact level ${impact}`);
    }
    a11yTest(entry, impact, webpackConfigPath);
  });

program
  .command('showcase')
  .description('create a website that shows component APIs and demos')
  .option('-f, --files [pattern]', 'metadata file pattern')
  .option('--output [dir]', 'output folder for the generated website')
  .action((options) => {
    const outputPath: string | null = options.output ? path.join(projectPath, options.output) : null;

    const metadataGlob: string = options.files || defaultMetaGlob;

    const projectOptions = {
      projectPath,
      sourcesGlob: 'src/**/*.ts?(x)',
      metadataGlob,
      webpackConfigPath,
    };

    if (outputPath) {
      buildWebsite({
        projectOptions,
        outputPath,
      });
    } else {
      startWebsite({
        projectOptions,
        host: 'localhost',
        port: 8888,
      });
    }
  });

program.parse(process.argv);
