import Registry, {importMeta} from '@ui-autotools/registry';
import {consoleLog} from '@ui-autotools/utils';
import * as fs from 'fs';
import * as path from 'path';

function generateFile(
  componentName: string,
  componentPath: string,
  componentDisplayName: string,
  simName: string,
  simIndex: number,
  styleName?: string,
  stylePath?: string,
  styleIndex?: number) {
  const styleImport = stylePath ? `import style from '${stylePath}';\n` : '';
  const styleExport = stylePath ? ', style' : '';
  const variantString = styleIndex ? `@variant${styleIndex}@${styleName}` : '';

  const data = `${styleImport}import {${componentName}} from '${componentPath}';
export default {comp: ${componentName}, name: '${componentDisplayName}'${styleExport}};
`;

  fs.writeFileSync(`./.autotools/${componentDisplayName}@sim${simIndex}@${simName}${variantString}.ts`, data);
}

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
            generateFile(compName, compPath, compDisplayName!, simulationName, i, style.name, stylePath, styleIndex);
            styleIndex++;
          });
        } else {
          generateFile(compName, compPath, compDisplayName, simulationName, i);
        }
      }
    }
  });
};
