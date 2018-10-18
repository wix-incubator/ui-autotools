import { IRegistry } from '@ui-autotools/registry';
import { consoleLog } from '@ui-autotools/utils';
import {createAutotoolsFolder} from './create-autotools-folder';
import { writeDataToFs } from './write-data-to-fs';
import { generateIndexFileData } from './generate-index-file-data';

export interface IFileInfo {
  basename: string;
  filepath: string;
  data: string;
}

const stylePathPrefix = '../../'; // We're two folders deep in .autotools
const compPathPrefix = '../../';

export const buildBaseFiles = (projectPath: string, Registry: IRegistry): IFileInfo[] => {
  consoleLog('Building base files...');
  const autotoolsFolder = createAutotoolsFolder(projectPath);
  const files = generateIndexFileData(Registry, autotoolsFolder, compPathPrefix, stylePathPrefix);
  writeDataToFs(files);

  return files;
};
