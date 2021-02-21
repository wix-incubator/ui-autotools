import glob from 'glob';
import { Command } from 'commander';
import { cliInit, defaultMetaGlob, getWebpackConfigPath } from '@ui-autotools/node-utils';
import ssrTest from './ssr-test/mocha-wrapper';
import { hydrationTest } from './hydration-test/server';

const projectPath = process.cwd();
cliInit(projectPath);
const program = new Command();
const webpackConfigPath = getWebpackConfigPath(projectPath);

program
  .description('run sanity checks on all components with a metadata description')
  .option('-f, --files [pattern]', 'Grep file')
  .action((options: Record<string, string>) => {
    const metaGlob = options.files || defaultMetaGlob;
    glob.sync(metaGlob, { absolute: true, cwd: projectPath }).forEach(require);
    ssrTest();
    void hydrationTest(projectPath, metaGlob, webpackConfigPath);
  });

program.parse(process.argv);
