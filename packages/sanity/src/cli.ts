#!/usr/bin/env node
import path from 'path';
import glob from 'glob';
import dotenv from 'dotenv';
import { Command } from 'commander';
import { hydrationTest } from './';
import ssrTest from './ssr-test/mocha-wrapper';
import { registerRequireHooks } from '@ui-autotools/utils';

dotenv.config();
registerRequireHooks();

const program = new Command();
const projectPath = process.cwd();
const defaultMetaGlob = 'src/**/*.meta.ts?(x)';
const webpackConfigPath = path.join(projectPath, '.autotools/webpack.config.js');

program
    .description('run sanity checks on all components with a metadata description')
    .option('-f, --files [pattern]', 'Grep file')
    .action((options) => {
        const metaGlob: string = options.files || defaultMetaGlob;
        glob.sync(metaGlob, { absolute: true, cwd: projectPath }).forEach(require);
        ssrTest();
        hydrationTest(projectPath, metaGlob, webpackConfigPath);
    });

program.parse(process.argv);
