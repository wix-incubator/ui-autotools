import React from 'react';
import {ISchemaViewProps} from '../schema-view';
import { BaseView } from './base';

export const ModuleView: React.FunctionComponent<ISchemaViewProps> = (props) => {
  const definitions = {...props.schema.properties, ...props.schema.definitions};
  const defs = Array.from(Object.entries(definitions)).map(([name, defSchema]) => (
    <div key={name}>
      <h2>{name}:</h2>
      <BaseView
        schema={defSchema}
        schemaRegistry={props.schemaRegistry}
        viewRegistry={props.viewRegistry}
      />
    </div>
  ));

  return (
    <div>
      <h1>Module</h1>
      <div><em>{props.schema.$id}</em></div>
      {defs}
    </div>
  );
};
