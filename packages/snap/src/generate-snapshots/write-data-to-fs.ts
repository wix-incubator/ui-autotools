import fs from 'fs';
import { IFileInfo } from './build-base-files';

export function writeDataToFs(files: IFileInfo[]): void {
  for (const file of files) {
    fs.writeFileSync(file.filepath, file.data);
  }
}
