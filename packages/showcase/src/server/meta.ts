import 'typescript-support';
import * as React from 'react';
import glob from 'glob';
import Registry from '@ui-autotools/registry';
import {IComponentMetadata, IMetadata} from '@ui-autotools/registry';
// TODO: extract-schema should be exported from the index
import {extractSchema} from '@ui-autotools/schema-extract/cjs/extract-schema';
// TODO: json-schema-types should be exported from the index
import {ModuleSchema as PartialModuleSchema, IObjectFields, Schema} from '@ui-autotools/schema-extract/cjs/json-schema-types';

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
  const ref = property.$ref!;

  return ref.startsWith('#typeof') ?
    schema.definitions![ref.replace('#typeof ', '')] :
    property;
}

function isExportProbablyAComponent(
  schemas: ModuleSchemasByFilename,
  file: string,
  exportName: string
) {
  const exportSchema = getSchemaForExport(schemas, file, exportName);

  // TODO: we could check that it extends react#Component, but that would
  // require traversing the inheritance chain. Maybe the linker will give us
  // this?
  return (
    exportSchema.$ref === 'react#SFC' ||
    exportSchema.$ref === 'common/class'
  );
}

function findComponentSchemas(
  componentsMetadata: Map<React.ComponentType, IComponentMetadata<any>>,
  schemas: ModuleSchemasByFilename
) {
  const matches: Map<React.ComponentType, IExportSourceAndSchema> = new Map();

  for (const {file, schema} of schemas.values()) {
    if (!schema.properties) {
      continue;
    }

    for (const exportName in schema.properties) {
      if (!isExportProbablyAComponent(schemas, file, exportName)) {
        continue;
      }
      const Comp = require(file)[exportName];
      // TODO: if the same component is exported from multiple files we want the
      // one it's defined in. OTOH, we probably don't care that much about the
      // file path, we just want to be sure we can resolve the schema and aren't
      // doing the same work twice.
      if (componentsMetadata.has(Comp)) {
        const exportSchema = getSchemaForExport(schemas, file, exportName);
        matches.set(Comp, {file, name: exportName, schema: exportSchema});
      }
    }
  }

  return matches;
}

export function getMetadataAndSchemasInDirectory(
  path: string,
  metadataGlob: string,
  sourceGlob: string
): IMetadataAndSchemas {
  const metadataFiles = glob.sync(metadataGlob, {
    cwd: path,
    absolute: true
  });
  metadataFiles.forEach(require);
  const metadata = Registry.metadata;

  const schemas = Array.from(extractSchema(path, sourceGlob));
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
