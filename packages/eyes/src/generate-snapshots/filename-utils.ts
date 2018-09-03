import {basename} from 'path';

export interface IFileParts {
  compName: string;
  simIndex: number;
  simName: string;
  styleIndex?: number;
  styleName?: string;
}

export function generateFilename(componentName: string, simName: string, simIndex: number, styleName?: string, styleIndex?: number): string {
  const variantString = styleIndex ? `@${styleIndex}@${styleName}` : '';
  return `${componentName}@${simIndex}@${simName}${variantString}.ts`;
}

export function generateData(componentName: string, componentPath: string, stylePath?: string): string {
  const styleImport = stylePath ? `import style from '${stylePath}';\n` : '';
  const styleExport = stylePath ? ', style' : '';

  const data = `${styleImport}import {${componentName}} from '${componentPath}';
export default {comp: ${componentName}, name: '${componentName}'${styleExport}};
`;

  return data;
}

export function parseSnapshotFilename(file: string, suffix: string): IFileParts {
  const [compName, simIndex, simName, styleIndex, styleName] = basename(file, suffix).split('@');

  return {compName, simIndex: parseInt(simIndex, 10), simName, styleIndex: parseInt(styleIndex, 10), styleName};
}
