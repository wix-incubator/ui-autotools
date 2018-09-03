import Registry, {importMeta} from '@ui-autotools/registry';
import {consoleLog} from '@ui-autotools/utils';
import fs from 'fs';
import path from 'path';
import {generateFilename, generateData} from './filename-utils';

export const buildBaseFiles = (projectPath: string) => {
  consoleLog('Building base files...');
  consoleLog('Importing Metafiles...');
  importMeta();

  const autotoolsFolder = path.join(projectPath, '.autotools');

  if (!fs.existsSync(autotoolsFolder)) {
    fs.mkdirSync(autotoolsFolder);
  }

  const stylePathPrefix = '../';
  const compPathPrefix = '../';
  let compName: string;

  Registry.metadata.components.forEach((componentMetadata) => {
    const numberOfSims = componentMetadata.simulations.length;
    const styles = componentMetadata.styles;
    const compPath = compPathPrefix + componentMetadata.path;
    compName = componentMetadata.exportName;

    if (compName) {
      for (let i = 0; i < numberOfSims; i++) {
        const simulationName = componentMetadata.simulations[i].title;
        if (styles.size) {
          let styleIndex = 1;
          styles.forEach((style) => {
            const stylePath = stylePathPrefix + style.path;
            const filename = generateFilename(compName, simulationName, i, style.name, styleIndex);
            const data = generateData(compName, compPath, stylePath);
            fs.writeFileSync(filename, data);
            styleIndex++;
          });
        } else {
          const filename = generateFilename(compName, simulationName, i);
          const data = generateData(compName, compPath);
          fs.writeFileSync(filename, data);
        }
      }
    }
  });
};
