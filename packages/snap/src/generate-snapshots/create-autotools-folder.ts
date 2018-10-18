import fs from 'fs';
import path from 'path';

export function createAutotoolsFolder(projectPath: string): string {
  const autotoolsFolder = path.join(projectPath, '.autotools', 'tmp');

  if (!fs.existsSync(autotoolsFolder)) {
    fs.mkdirSync(autotoolsFolder);
  }

  return autotoolsFolder;
}
