import {execSync} from 'child_process';
import {spawn} from 'child_process';
import isCI from 'is-ci';

if (isCI) {
  // tslint:disable-next-line:no-console
  console.log('Running snap on CI.');
  const snap = spawn('yarn snap');
  snap.stdout.on('data', (data: any) => { process.stdout.write(data.toString()); });
  snap.stderr.on('data', (data: any) => { process.stdout.write(data.toString()); });
  // tslint:disable-next-line:no-console
  snap.on('close', (code: number) => { console.log('Finished running snap with code ' + code); });
}
