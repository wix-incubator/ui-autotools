import { join } from 'path';
import process from 'process';
import chalk from 'chalk';
import { devDependencyLinter } from './dev-dependency-linter';

const pathToPackageJson = join(__dirname, '../package.json');

console.log('Linting devDependencies.');
devDependencyLinter(pathToPackageJson).then((errors) => {
  if (errors.length) {
    for (const error of errors) {
      const errorColour = error.type === 'Error' ? 'red' : 'yellow';
      console.error(`${chalk[errorColour](error.type)} in ${chalk.underline(error.packageName)}: ${error.message}`);
    }
    process.exit(1);
  }

  process.exit(0);
});
