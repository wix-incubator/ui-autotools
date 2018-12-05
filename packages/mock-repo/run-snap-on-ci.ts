import {exec} from 'child_process';
import isCI from 'is-ci';

if (isCI) {
  // tslint:disable-next-line:no-console
  console.log('Running snap on CI.');
  exec('yarn autotools-snap', (err, stdout, stderr) => {
    if (err) {
      // tslint:disable-next-line:no-console
      console.error('Error in autotools-snap: ', err);
      return;
    }

    process.stdout.write(stdout.toString());
    process.stderr.write(stderr.toString());
  });
}
