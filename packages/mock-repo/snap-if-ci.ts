import isCI from 'is-ci';
import {spawnSync} from 'child_process';

if (isCI) {
  const {status} = spawnSync('yarn', ['autotools-snap'], {stdio:'inherit', shell: true})
  if (status) {
    process.exitCode = status;
  }
}
