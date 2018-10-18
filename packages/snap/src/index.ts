import {buildBaseFiles} from './generate-snapshots/build-base-files';
import {generateSnapshots} from './generate-snapshots/generate-snapshots';
import {runEyes} from './snap-test/snap';
import {createTempDirectory} from 'create-temp-directory';
import Registry from '@ui-autotools/registry';
import path from 'path';
import fs from 'fs';

export interface IFileSystem {
  existsSync: (dir: string) => boolean;
  mkdirSync: (dir: string) => void;
  writeFileSync: (path: string, data: any) => void;
  readFileSync: (path: string, options?: string) => string | Buffer;
}

export interface IPath {
  join: (...args: string[]) => string;
}

export async function eyesTest(projectPath: string) {
  const tmpDir = await createTempDirectory();
  const files = buildBaseFiles(projectPath, Registry);
  await generateSnapshots(projectPath, tmpDir.path, Registry, files, path);
  await runEyes(projectPath, tmpDir.path, fs, files, path);
  await tmpDir.remove();
}
