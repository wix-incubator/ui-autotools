import path from 'path';
import type axe from 'axe-core';
import { Command } from 'commander';
import glob from 'glob';
import { cliInit, defaultMetaGlob, getWebpackConfigPath } from '@ui-autotools/node-utils';
import { a11yTest, impactLevels } from './index';

const projectPath = process.cwd();
cliInit(projectPath);
const program = new Command();
const webpackConfigPath = getWebpackConfigPath(projectPath);

program
  .description('run accessibility tests on components with metadata files that match the given pattern')
  .option('-f, --files [pattern]', 'metadata file pattern')
  .option(
    '-i, --impact <i>',
    `Only display issues with impact level <i> and higher. Values are: ${impactLevels.join(', ')}`
  )
  .action((options: Record<string, string>) => {
    const entry = glob.sync(path.join(projectPath, options.files ? options.files : defaultMetaGlob));
    const impact = options.impact || 'minor';
    if (!impactLevels.includes(impact as axe.ImpactValue)) {
      throw new Error(`Invalid impact level ${impact}`);
    }
    void a11yTest(entry, impact as axe.ImpactValue, webpackConfigPath);
  });

program.parse(process.argv);
