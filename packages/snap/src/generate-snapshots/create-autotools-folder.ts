import {directoryExists, mkdir} from 'proper-fs';
import {promisify} from 'util';
import rimraf from 'rimraf';
import path from 'path';

const rmdir = promisify(rimraf);

export interface ITempFolder {
  path: string;
  destroy: () => void;
}

export async function createTempFolder(projectPath: string): Promise<ITempFolder> {
  const tempFolder = path.join(projectPath, '.autotools', 'tmp');

  if (!await directoryExists(tempFolder)) {
    await mkdir(tempFolder);
  }

  const destroy = async () => {
    await rmdir(tempFolder);
  };

  return {path: tempFolder, destroy};
}
