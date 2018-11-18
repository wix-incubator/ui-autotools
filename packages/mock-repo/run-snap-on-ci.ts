import {execSync} from 'child_process';
import isCI from 'is-ci';

if (isCI) {
  // tslint:disable-next-line:no-console
  console.log('Running snap on CI.');
  execSync('yarn snap');
}
