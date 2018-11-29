#!/usr/bin/env node
import glob from 'glob';
import dotenv from 'dotenv';
import {Command} from 'commander';
import {eyesTest} from './';
import {registerRequireHooks} from '@ui-autotools/utils';

dotenv.config();
registerRequireHooks();

const program = new Command();
const projectPath = process.cwd();
const defaultMetaGlob = 'src/**/*.meta.ts?(x)';

program
.description('compare components to the expected appearance using Applitools Eyes')
.option('-f, --files [pattern]', 'metadata file pattern')
.option('-s, --skip-on-missing-key [boolean]', 'if flag is set, skip tests when no EYES or APPLITOOLS API key present')
.action(async (options) => {
  const metaGlob: string = options.files || defaultMetaGlob;
  try {
    glob.sync(metaGlob, {absolute: true, cwd: projectPath}).forEach(require);
    await eyesTest(projectPath, options.skipOnMissingKey);
  } catch (error) {
    process.exitCode = 1;
    if (error) {
      // Without a new-line, the error will not show on certain node versions
      process.stderr.write(error.toString() + '\n');
    }
  }
});

program.parse(process.argv);
