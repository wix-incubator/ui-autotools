import {basename} from 'path';

export interface IFileParts {
  base: string;
  compName: string;
  simIndex: number;
  simName: string;
  styleIndex?: number;
  styleName?: string;
}

export function generateFilename(componentName: string, simName: string, simIndex: number, styleName?: string): string {
  const variantString = styleName ? `@${styleName}` : '';
  return `${componentName}@${simIndex}@${simName}${variantString}.snapshot.ts`;
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
  const base = basename(file, suffix);
  const [compName, simIndex, simName, styleName] = base.split('@');

  return {base, compName, simIndex: parseInt(simIndex, 10), simName, styleName};
}
