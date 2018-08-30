import {buildBaseFiles} from './generate-snapshots/build-base-files';
import {generateSnapshots} from './generate-snapshots/generate-snapshots';
import {runEyes} from './eyes-test/eyes';
import * as tmp from 'tmp';

export async function eyesTest(projectPath: string) {
  const dir = tmp.dirSync({unsafeCleanup: true});

  try {
    buildBaseFiles();
    await generateSnapshots(dir.name);
    await runEyes(projectPath, dir.name);
  } catch (error) {
    process.exitCode = 1;
    if (error) {
      process.stderr.write(error.toString());
    }
  } finally {
    process.exit();
  }
}
