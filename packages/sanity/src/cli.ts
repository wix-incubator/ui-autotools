
import glob from 'glob';
import { Command } from 'commander';
import { hydrationTest } from './';
import ssrTest from './ssr-test/mocha-wrapper';
import { cliInit, defaultMetaGlob, getWebpackConfigPath } from '@ui-autotools/node-utils';

const projectPath = process.cwd();
cliInit(projectPath);
const program = new Command();
const webpackConfigPath = getWebpackConfigPath(projectPath);

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
