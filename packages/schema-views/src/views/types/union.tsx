import React from 'react';
import {intersperse} from '../../utils';
import {ISchemaViewProps} from '../../schema-view';
import {isPrimitiveUnion} from '../../schema-predicates';
import {Schema} from '../../schema';
import {BaseView} from '../base';
import style from './type.st.css';

export const UnionTypeView: React.FunctionComponent<ISchemaViewProps> = (props) => {
  const {schema} = props;

  const parts = isPrimitiveUnion(schema) ?
    schema.enum.map(JSON.stringify) :
    schema.$oneOf.flatMap((itemSchema: Schema) => (
      itemSchema.enum ?
        itemSchema.enum.map(JSON.stringify) :
        [(
          <BaseView
            schemaRegistry={props.schemaRegistry}
            viewRegistry={props.viewRegistry}
            schema={itemSchema}
          />
        )]
    ));

  return (
    <div {...style('root', {category: 'union'}, props)}>
      {React.Children.toArray(intersperse(parts, ' | '))}
    </div>
  );
};
