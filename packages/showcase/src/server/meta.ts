import 'typescript-support';
import * as React from 'react';
import path from 'path';
import glob from 'glob';
import Registry, {getCompName} from '@ui-autotools/registry';
import {IComponentMetadata, IMetadata} from '@ui-autotools/registry';
import {
  // getSchema,
  createLinker,
  ModuleSchema as PartialModuleSchema,
  IObjectFields,
  Schema
} from '@ui-autotools/schema-extract';

export type ModuleSchema = PartialModuleSchema & IObjectFields;

export interface IModuleSchemaWithFilename {
  file: string;
  schema: ModuleSchema;
}

export type ModuleSchemasByFilename = Map<string, IModuleSchemaWithFilename>;

export interface IExportSourceAndSchema {
  file: string;
  name: string;
  schema: Schema<any>;
}

export interface IMetadataAndSchemas {
  metadata: IMetadata;
  schemasByComponent: Map<React.ComponentType, IExportSourceAndSchema>;
}

function findComponentSchemas(
  componentsMetadata: Map<React.ComponentType, IComponentMetadata<any>>,
  basePath: string,
  sourceGlob: string
) {
  const sourceFilenames = glob.sync(sourceGlob, {
    cwd: basePath,
    absolute: true
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
  // const program = createLinkerProgram(sourceFilenames);
  const linker = createLinker(sourceFilenames, basePath);
  for (const Comp of componentsMetadata.keys()) {
    const name = getCompName(Comp);
    const metaFile = sourceFilenames.find((file) =>
      normalize(path.basename(file)) === normalize(name + '.meta.ts') ||
      normalize(path.basename(file)) === normalize(name + '.meta.tsx')
    );
    if (!metaFile) {
      continue;
    }
    const componentFile = sourceFilenames.find((file) => (
      file.replace(/\.tsx?$/, '') === metaFile.replace(/\.meta\.tsx?$/, '')
    ));
    if (!componentFile) {
      continue;
    }
    const exportSchema = linker.flatten(componentFile, name);
    // const exportSchema = getSchema(componentFile, name, program);
    if (!exportSchema) {
      continue;
    }
    matches.set(Comp, {file: componentFile, name, schema: exportSchema});
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
    absolute: true
  });
  metadataFiles.forEach(require);
  const metadata = Registry.metadata;
  const schemasByComponent = findComponentSchemas(
    metadata.components,
    basePath,
    sourceGlob
  );
  return {metadata, schemasByComponent};
}
