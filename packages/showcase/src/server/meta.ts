import '@ts-tools/node/r';
import type React from 'react';
import path from 'path';
import glob from 'glob';
import Registry, { getCompName, IComponentMetadata, IMetadata } from '@ui-autotools/registry';
import { createLinker, IModuleSchema, ICodeSchema } from '@wix/typescript-schema-extract';

export interface IModuleSchemaWithFilename {
  file: string;
  schema: IModuleSchema;
}

export type ModuleSchemasByFilename = Map<string, IModuleSchemaWithFilename>;

export interface IExportSourceAndSchema {
  file: string;
  name: string;
  schema: ICodeSchema;
}

export interface IMetadataAndSchemas {
  metadata: IMetadata;
  schemasByComponent: Map<React.ComponentType, IExportSourceAndSchema>;
}

function findComponentSchemas(
  componentsMetadata: Map<React.ComponentType, IComponentMetadata<any, any>>,
  basePath: string,
  sourceGlob: string
) {
  const sourceFilenames = glob.sync(sourceGlob, {
    cwd: basePath,
    absolute: true,
  });

  const matches: Map<React.ComponentType, IExportSourceAndSchema> = new Map();

  // TODO: we make too many assumptions here. That the meta file name is the
  // same as the component's displayName, that the meta file and the
  // component file sit side by side in the same folder, and that they have the
  // same basename.
  // Since creating schema for a module is expensive, ideally the information
  // about the component's filename and the export name should be contained in
  // its metadata.
  const normalize = (string: string) => string.toLowerCase().replace(/-/g, '');
  const linker = createLinker(sourceFilenames);
  for (const Comp of componentsMetadata.keys()) {
    const name = getCompName(Comp);
    const metaFile = sourceFilenames.find(
      (file) =>
        normalize(path.basename(file)) === normalize(name + '.meta.ts') ||
        normalize(path.basename(file)) === normalize(name + '.meta.tsx')
    );
    if (!metaFile) {
      continue;
    }
    const componentFile = sourceFilenames.find(
      (file) => file.replace(/\.tsx?$/, '') === metaFile.replace(/\.meta\.tsx?$/, '')
    );
    if (!componentFile) {
      continue;
    }
    const exportSchema = linker.flatten(componentFile, name);
    if (!exportSchema) {
      continue;
    }
    matches.set(Comp, { file: componentFile, name, schema: exportSchema });
  }

  return matches;
}

export function getMetadataAndSchemasInDirectory(
  basePath: string,
  metadataGlob: string,
  sourceGlob: string
): IMetadataAndSchemas {
  const metadataFiles = glob.sync(metadataGlob, {
    cwd: basePath,
    absolute: true,
  });
  metadataFiles.forEach(require);
  const metadata = Registry.metadata;
  const schemasByComponent = findComponentSchemas(metadata.components, basePath, sourceGlob);
  return { metadata, schemasByComponent };
}

export function getComponentNamesFromMetadata(metadata: IMetadata): string[] {
  return Array.from(metadata.components.values()).map(({ component }) => getCompName(component));
}
