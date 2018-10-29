import {buildBaseFiles} from './generate-snapshots/build-base-files';
import {generateSnapshots} from './generate-snapshots/generate-snapshots';
import {runEyes} from './snap-test/snap';
import {createTempDirectory} from 'create-temp-directory';
import {eyesKeyExists} from './snap-test/eyes-key-exists';
import Registry from '@ui-autotools/registry';
import { consoleLog } from '@ui-autotools/utils';

export async function eyesTest(projectPath: string, skipOnMissingKey: boolean) {
  if (eyesKeyExists(skipOnMissingKey)) {
    const tmpDir = await createTempDirectory();
    const files = buildBaseFiles(projectPath, Registry);
    await generateSnapshots(projectPath, tmpDir.path, Registry, files);
    await runEyes(projectPath, tmpDir.path, files);
    await tmpDir.remove();
  } else {
    consoleLog('The "--skip-on-missing-key" flag was set to true, and no API key exists, so snap is skipping the eyes test.');
  }
}
