import 'typescript-support';
import * as React from 'react';
import path from 'path';
import glob from 'glob';
import Registry, {getCompName} from '@ui-autotools/registry';
import {IComponentMetadata, IMetadata} from '@ui-autotools/registry';
import {
  extractSchema,
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
  schemasByFilename: Map<string, IModuleSchemaWithFilename>;
  schemasByComponent: Map<React.ComponentType, IExportSourceAndSchema>;
}

function getSchemaForExport(
  moduleSchemas: ModuleSchemasByFilename,
  file: string,
  exportName: string
) {
  if (!moduleSchemas.has(file)) {
    throw new Error(`Schema for "${file}" is missing`);
  }

  const {schema} = moduleSchemas.get(file)!;
  if (!schema.properties) {
    throw new Error(`Export "${exportName}" not found`);
  }

  const property = schema.properties[exportName];
  const ref = property.$ref;

  return ref && ref.startsWith('#typeof') ?
    schema.definitions![ref.replace('#typeof ', '')] :
    property;
}

function findComponentSchemas(
  componentsMetadata: Map<React.ComponentType, IComponentMetadata<any>>,
  schemas: ModuleSchemasByFilename
) {
  const matches: Map<React.ComponentType, IExportSourceAndSchema> = new Map();
  const sourceFilenames = Array.from(schemas.keys());

  // TODO: we make too many assumptions here. That the meta file name is the
  // same as the component's displayName, that the meta file and the
  // component file sit side by side in the same folder, and that they have the
  // same basename.
  // Since creating schema for a module is expensive, ideally the information
  // about the component's filename and the export name should be contained in
  // its metadata.
  const normalize = (string: string) => string.toLowerCase().replace(/-/g, '');
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
    const exportSchema = getSchemaForExport(schemas, componentFile, name);
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

  const schemas = Array.from(extractSchema(basePath, sourceGlob));
  const schemasByFilename: ModuleSchemasByFilename = new Map();
  for (const item of schemas) {
    schemasByFilename.set(item.file, item);
  }

  const schemasByComponent = findComponentSchemas(
    metadata.components,
    schemasByFilename
  );

  return {metadata, schemasByFilename, schemasByComponent};
}
