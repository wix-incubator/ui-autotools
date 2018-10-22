import React from 'react';
import {BaseView} from '../base';
import {isSimpleType} from '../../schema-predicates';
import {ISchemaViewProps} from '../../schema-view';
import style from './type.st.css';

export const ArrayTypeView: React.SFC<ISchemaViewProps> = (props) => {
  const itemSchema = props.schema.items;

  const itemJsx = (
    <BaseView
      schemaRegistry={props.schemaRegistry}
      viewRegistry={props.viewRegistry}
      schema={itemSchema}
    />
  );

  const arrayJsx = isSimpleType(itemSchema) ?
    <>{itemJsx}[]</> :
    <>Array{'<'}{itemJsx}{'>'}</>;

  return (
    <div {...style('root', {category: 'array'}, props)}>
      {arrayJsx}
    </div>
  );
};
