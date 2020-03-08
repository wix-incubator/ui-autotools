export interface IFileParts {
  compName: string;
  simName: string;
  styleIndex?: number;
  styleName?: string;
}

export function generateSnapshotFilename(componentName: string, simName: string, styleName?: string): string {
  const variantString = styleName ? `@${styleName}` : '';
  return `${componentName}@${simName}${variantString}`;
}

export function generateData(componentName: string, componentPath: string, stylePath?: string): string {
  const styleImport = stylePath ? `import {style} from '${stylePath}';\n` : '';
  const styleExport = stylePath ? ', style' : '';

  const data = `${styleImport}import {${componentName}} from '${componentPath}';
export default {comp: ${componentName}, name: '${componentName}'${styleExport}};
`;

  return data;
}

export function parseSnapshotFilename(file: string): IFileParts {
  const [compName, simName, styleName] = file.split('@');

  return {compName, simName, styleName};
}
