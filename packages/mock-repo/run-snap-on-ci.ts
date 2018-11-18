import {execSync} from 'child_process';
import isCI from 'is-ci';

if (isCI) {
  execSync('yarn snap');
}
