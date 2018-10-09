import {buildBaseFiles} from './generate-snapshots/build-base-files';
import {generateSnapshots} from './generate-snapshots/generate-snapshots';
import {runEyes} from './snap-test/snap';
import { createTempDirectory } from 'create-temp-directory';
import Registry from '@ui-autotools/registry';
import fs from 'fs';
import util from 'util';

export async function eyesTest(projectPath: string) {
  const tmpDir = await createTempDirectory();
  try {
    fs.writeFileSync('./data.json', util.inspect(Registry, false, 2, false));
    buildBaseFiles(projectPath, Registry);
    await generateSnapshots(projectPath, tmpDir.path, Registry);
    await runEyes(projectPath, tmpDir.path);
  } catch (e) {
    throw e;
  } finally {
    await tmpDir.remove();
  }
}
