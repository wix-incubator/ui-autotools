import Registry, {importMeta} from '@ui-autotools/registry';
import {consoleLog} from '@ui-autotools/utils';
import * as fs from 'fs';
import * as path from 'path';
import {generateFilename, generateData} from './filename-utils';

export const buildBaseFiles = () => {
  consoleLog('Building base files...');
  consoleLog('Importing Metafiles...');
  importMeta();

  const generatedDir = path.join(process.cwd(), '.autotools');

  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir);
  }

  const stylePathPrefix = '../';
  const compPathPrefix = '../';
  let compName: string;
  let compDisplayName: string;

  Registry.metadata.components.forEach((componentMetadata) => {
    const numberOfSims = componentMetadata.simulations.length;
    const styles = componentMetadata.styles;
    const compPath = compPathPrefix + componentMetadata.compInfo.path;
    compName = componentMetadata.compInfo.importName;
    compDisplayName = componentMetadata.compInfo.displayName;

    if (compDisplayName && compName) {
      for (let i = 1; i <= numberOfSims; i++) {
        const simulationName = componentMetadata.simulations[i - 1].title;
        if (styles.size) {
          let styleIndex = 1;
          styles.forEach((style) => {
            const stylePath = stylePathPrefix + style.path;
            const filename = generateFilename(compDisplayName!, simulationName, i, style.name, styleIndex);
            const data = generateData(compName, compPath, compDisplayName!, stylePath);
            fs.writeFileSync(filename, data);
            styleIndex++;
          });
        } else {
          const filename = generateFilename(compDisplayName, simulationName, i);
          const data = generateData(compName, compPath, compDisplayName);
          fs.writeFileSync(filename, data);
        }
      }
    }
  });
};
