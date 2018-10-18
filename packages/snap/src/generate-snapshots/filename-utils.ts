export interface IFileParts {
  compName: string;
  simIndex: number;
  simName: string;
  styleIndex?: number;
  styleName?: string;
}

export function generateSnapshotFilename(componentName: string, simName: string, simIndex: number, styleName?: string): string {
  const variantString = styleName ? `@${styleName}` : '';
  return `${componentName}@${simIndex}@${simName}${variantString}`;
}

export function generateData(componentName: string, componentPath: string, stylePath?: string): string {
  const styleImport = stylePath ? `import style from '${stylePath}';\n` : '';
  const styleExport = stylePath ? ', style' : '';

  const data = `${styleImport}import {${componentName}} from '${componentPath}';
export default {comp: ${componentName}, name: '${componentName}'${styleExport}};
`;

  return data;
}

export function parseSnapshotFilename(file: string): IFileParts {
  const [compName, simIndex, simName, styleName] = file.split('@');

  return {compName, simIndex: parseInt(simIndex, 10), simName, styleName};
}
