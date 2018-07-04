import {devDependencyLinter} from './dev-dependency-linter';
import {join} from 'path';
import process from 'process';
import chalk from 'chalk';

const pathToPackageJson = join(__dirname, '../package.json');

devDependencyLinter(pathToPackageJson).then((errors) => {
  for (const error of errors) {
    const errorColour = error.type === 'Error' ? 'red' : 'yellow';
    // tslint:disable-next-line:no-console
    console.error(`${chalk[errorColour](error.type)} in ${chalk.underline(error.packageName)}: ${error.message}`);
  }
  process.exit(1);
});
