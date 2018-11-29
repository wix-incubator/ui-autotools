
import glob from 'glob';
import { Command } from 'commander';
import { hydrationTest } from './';
import ssrTest from './ssr-test/mocha-wrapper';
import { cliInit, defaultMetaGlob, getDefaultWebpackConfigPath } from '@ui-autotools/utils';

cliInit();
const program = new Command();
const projectPath = process.cwd();
const webpackConfigPath = getDefaultWebpackConfigPath(projectPath);

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
