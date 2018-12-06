import path from 'path';
import {generateSnapshotFilename, generateData} from './filename-utils';
import {IRegistry} from '@ui-autotools/registry';
import {consoleLog} from '@ui-autotools/utils';
import {createTempFolder, ITempFolder} from './create-autotools-folder';
import {writeDataToFs} from './write-data-to-fs';

export interface IFileInfo {
  basename: string;
  filepath: string;
  data: string;
}

const stylePathPrefix = '../../'; // We're two folders deep in .autotools
const compPathPrefix = '../../';

export function generateIndexFileData(Registry: IRegistry, autotoolsFolder: string): IFileInfo[]  {
  const files: IFileInfo[] = [];

  Registry.metadata.components.forEach((componentMetadata) => {
    const simIndex = componentMetadata.simulations.length;
    const styles = componentMetadata.styles;
    const compPath =  path.join(compPathPrefix, componentMetadata.path);
    const compName = componentMetadata.exportName;

    if (compName) {
      for (let i = 0; i < simIndex; i++) {
        const simulationName = componentMetadata.simulations[i].title;
        if (styles.size) {
          styles.forEach((style) => {
            const stylePath = path.join(stylePathPrefix, style.path);
            const basename = generateSnapshotFilename(compName, simulationName, i, style.name);
            const filepath = path.join(autotoolsFolder, basename + '.snapshot.ts');
            const data = generateData(compName, compPath, stylePath);
            files.push({basename, filepath, data});
          });
        } else {
          // We only want to render the base style if there are no other style variants
          const basename = generateSnapshotFilename(compName, simulationName, i);
          const filepath = path.join(autotoolsFolder, basename, '.snapshot.ts');
          const data = generateData(compName, compPath);
          files.push({basename, filepath, data});
        }
      }
    }
  });

  return files;
}

export const buildBaseFiles = async (projectPath: string, Registry: IRegistry): Promise<{files: IFileInfo[], baseFilesDir: ITempFolder}> => {
  consoleLog('Building base files...');
  const baseFilesDir = await createTempFolder(projectPath);
  const files = generateIndexFileData(Registry, baseFilesDir.path);
  writeDataToFs(files);

  return {files, baseFilesDir};
};
