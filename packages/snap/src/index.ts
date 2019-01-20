import {buildBaseFiles} from './generate-snapshots/build-base-files';
import {generateSnapshots} from './generate-snapshots/generate-snapshots';
import {generateSnapshots2} from './generate-snapshots/bundle-snapshots';
import {runEyes} from './snap-test/snap';
import {createTempDirectory} from 'create-temp-directory';
import {eyesKeyExists} from './snap-test/eyes-key-exists';
import Registry from '@ui-autotools/registry';
import { consoleLog } from '@ui-autotools/utils';

export async function eyesTest(projectPath: string, skipOnMissingKey: boolean) {
  if (eyesKeyExists()) {
    const tmpDir = await createTempDirectory();
    const {files, baseFilesDir} = await buildBaseFiles(projectPath, Registry);
    await generateSnapshots(projectPath, tmpDir.path, Registry, files);
    await runEyes(projectPath, tmpDir.path, files);
    await baseFilesDir.destroy();
    await tmpDir.remove();
  } else if (skipOnMissingKey) {
    consoleLog('The "--skip-on-missing-key" flag was set to true, and no API key exists, so snap is skipping the eyes test.');
  } else {
    throw new Error('The environment variable "APPLITOOLS_API_KEY" needs to be defined.');
  }
}

export async function eyesTest2(projectPath: string, skipOnMissingKey: boolean) {
  if (eyesKeyExists()) {
    const tmpDir = await createTempDirectory();
    const files = await generateSnapshots2(projectPath, tmpDir.path, Registry);
    await runEyes(projectPath, tmpDir.path, files);
    await tmpDir.remove();
  } else if (skipOnMissingKey) {
    consoleLog('The "--skip-on-missing-key" flag was set to true, and no API key exists, so snap is skipping the eyes test.');
  } else {
    throw new Error('The environment variable "APPLITOOLS_API_KEY" needs to be defined.');
  }
}
