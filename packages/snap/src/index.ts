import {buildBaseFiles} from './generate-snapshots/build-base-files';
import {generateSnapshots} from './generate-snapshots/generate-snapshots';
import {runEyes} from './snap-test/snap';
import tmp from 'tmp';
import Registry from '@ui-autotools/registry';

export async function eyesTest(projectPath: string) {
  const dir = tmp.dirSync({unsafeCleanup: true});
  buildBaseFiles(projectPath, Registry);
  await generateSnapshots(projectPath, dir.name, Registry);
  await runEyes(projectPath, dir.name);
}
