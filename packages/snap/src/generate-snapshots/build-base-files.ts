import {consoleLog} from '@ui-autotools/utils';
import {generateSnapshotFilename, generateData} from './filename-utils';
import { IRegistry } from '@ui-autotools/registry';
import path from 'path';
import { IFileSystem } from '..';

export interface IFileInfo {
  basename: string;
  filepath: string;
}

export const buildBaseFiles = (projectPath: string, Registry: IRegistry, fs: IFileSystem): IFileInfo[] => {
  consoleLog('Building base files...');

  const autotoolsFolder = path.join(projectPath, '.autotools', 'tmp');

  if (!fs.existsSync(autotoolsFolder)) {
    fs.mkdirSync(autotoolsFolder);
  }

  const stylePathPrefix = '../../'; // We're two folders deep in .autotools
  const compPathPrefix = '../../';
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
            files.push({basename, filepath});
            const data = generateData(compName, compPath, stylePath);
            fs.writeFileSync(filepath, data);
          });
        } else {
          // We only want to render the base style if there are no other style variants
          const basename = generateSnapshotFilename(compName, simulationName, i);
          const filepath = path.join(autotoolsFolder, basename, '.snapshot.ts');
          files.push({basename, filepath});
          const data = generateData(compName, compPath);
          fs.writeFileSync(filepath, data);
        }
      }
    }
  });

  return files;
};
