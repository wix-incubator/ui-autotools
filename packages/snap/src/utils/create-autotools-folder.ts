import path from 'path';
import fs from 'fs';
import {promisify} from 'util';
import rimraf from 'rimraf';

const rmdir = promisify(rimraf);
const {mkdir, stat} = fs.promises;

async function directoryExists(directoryPath: string): Promise<boolean> {
  try {
    return (await stat(directoryPath)).isDirectory()
  }catch{
    return false
  }
}

export interface ITempFolder {
  path: string;
  destroy: () => void;
}

export async function createTempFolder(projectPath: string): Promise<ITempFolder> {
  const tempFolder = path.join(projectPath, '.autotools', 'tmp');

  if (!await directoryExists(tempFolder)) {
    await mkdir(tempFolder, { recursive: true });
  }

  const destroy = async () => {
    await rmdir(tempFolder);
  };

  return {path: tempFolder, destroy};
}
