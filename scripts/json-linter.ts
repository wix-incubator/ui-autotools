import {devDependencyLinter} from './dev-dependency-linter';
import {join} from 'path';

const pathToPackageJson = join(__dirname, '../package.json');

const errors = devDependencyLinter(pathToPackageJson);

if (errors) {
  throw errors;
}
