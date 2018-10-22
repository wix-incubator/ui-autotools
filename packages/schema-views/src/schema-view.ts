import React from 'react';
import {Schema, SchemaRegistry} from './schema';
import {SchemaViewRegistry} from './schema-view-registry';

export interface ISchemaViewProps {
  schema: Schema;
  schemaRegistry: SchemaRegistry;
  viewRegistry: SchemaViewRegistry;
  className?: string;
}

export type SchemaView = React.ComponentType<ISchemaViewProps>;
