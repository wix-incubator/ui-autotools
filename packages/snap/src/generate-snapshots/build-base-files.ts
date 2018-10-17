import {consoleLog} from '@ui-autotools/utils';
import {generateSnapshotFilename, generateData} from './filename-utils';
import { IRegistry } from '@ui-autotools/registry';
import path from 'path';

export const buildBaseFiles = (projectPath: string, Registry: IRegistry, fs: any) => {
  consoleLog('Building base files...');

  const autotoolsFolder = path.join(projectPath, '.autotools', 'tmp');

  if (!fs.existsSync(autotoolsFolder)) {
    fs.mkdirSync(autotoolsFolder);
  }

  const stylePathPrefix = '../../'; // We're two folders deep in .autotools
  const compPathPrefix = '../../';

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
            const filename = generateSnapshotFilename(compName, simulationName, i, style.name);
            const data = generateData(compName, compPath, stylePath);
            fs.writeFileSync(path.join(autotoolsFolder, filename), data);
          });
        } else {
          // We only want to render the base style if there are no other style variants
          const filename = generateSnapshotFilename(compName, simulationName, i);
          const data = generateData(compName, compPath);
          fs.writeFileSync(path.join(autotoolsFolder, filename), data);
        }
      }
    }
  });
};
