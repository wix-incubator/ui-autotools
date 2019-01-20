import glob from 'glob';
import { Command } from 'commander';
import { eyesTest2 } from './';
import { cliInit, defaultMetaGlob } from '@ui-autotools/node-utils';

const projectPath = process.cwd();
cliInit(projectPath);
const program = new Command();

program
  .description('compare components to the expected appearance using Applitools Eyes')
  .option('-f, --files [pattern]', 'metadata file pattern')
  .option('-s, --skip-on-missing-key [boolean]', 'if flag is set, skip tests when no EYES or APPLITOOLS API key present')
  .action(async (options) => {
    const metaGlob: string = options.files || defaultMetaGlob;
    try {
      // This code is duplicated and used in sanity as well. We may want to find a way to share it
      glob.sync(metaGlob, { absolute: true, cwd: projectPath }).forEach(require);
      await eyesTest2(projectPath, options.skipOnMissingKey);
    } catch (error) {
      process.exitCode = 1;
      if (error) {
        // Without a new-line, the error will not show on certain node versions
        process.stderr.write(error.toString() + '\n');
      }
    }
  });

program.parse(process.argv);
