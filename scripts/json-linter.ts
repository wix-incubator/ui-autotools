import {devDependencyLinter} from './dev-dependency-linter';
import {join} from 'path';

const pathToPackageJson = join(__dirname, '../package.json');

const errors = devDependencyLinter(pathToPackageJson);

for (const error of errors) {
  // tslint:disable-next-line:no-console
  console.error(error);

}
