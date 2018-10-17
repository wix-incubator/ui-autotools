import {buildBaseFiles} from './generate-snapshots/build-base-files';
import {generateSnapshots} from './generate-snapshots/generate-snapshots';
import {runEyes} from './snap-test/snap';
import {createTempDirectory} from 'create-temp-directory';
import Registry from '@ui-autotools/registry';

export async function eyesTest(projectPath: string, fs: any) {
  const tmpDir = await createTempDirectory();
  const files = buildBaseFiles(projectPath, Registry, fs);
  await generateSnapshots(projectPath, tmpDir.path, Registry, files);
  await runEyes(projectPath, tmpDir.path, fs, files);
  await tmpDir.remove();
}
