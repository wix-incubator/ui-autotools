import React from 'react';
import {intersperse} from '../../utils';
import {ISchemaViewProps} from '../../schema-view';
import {isPrimitiveUnion} from '../../schema-predicates';
import {BaseView} from '../base';
import style from './type.st.css';

export const UnionTypeView: React.FunctionComponent<ISchemaViewProps> = (props) => {
  const {schema} = props;

  const itemSchemas = isPrimitiveUnion(schema) ? [schema] : schema.$oneOf;
  const itemNodes = [];
  for (const itemSchema of itemSchemas) {
    if (isPrimitiveUnion(itemSchema)) {
      for (const primitiveType of itemSchema.enum) {
        itemNodes.push(JSON.stringify(primitiveType));
      }
    } else {
      itemNodes.push(
        <BaseView
          schemaRegistry={props.schemaRegistry}
          viewRegistry={props.viewRegistry}
          schema={itemSchema}
        />
      );
    }
  }

  return (
    <div {...style('root', {category: 'union'}, props)}>
      {React.Children.toArray(intersperse(itemNodes, ' | '))}
    </div>
  );
};
