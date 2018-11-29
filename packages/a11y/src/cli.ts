#!/usr/bin/env node
import {Command} from 'commander';
import {a11yTest, impactLevels} from './';
import dotenv from 'dotenv';
import path from 'path';
import glob from 'glob';
import {registerRequireHooks} from '@ui-autotools/utils';

dotenv.config();
registerRequireHooks();

const program = new Command();
const projectPath = process.cwd();
const defaultMetaGlob = 'src/**/*.meta.ts?(x)';
const webpackConfigPath = path.join(projectPath, '.autotools/webpack.config.js');

program
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

program.parse(process.argv);
