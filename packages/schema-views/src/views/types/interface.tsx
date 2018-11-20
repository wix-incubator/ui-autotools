import React from 'react';
import {intersperse} from '../../utils';
import {BaseView} from '../base';
import {ISchemaViewProps} from '../../schema-view';
import {isValidJsIdentifier} from '../../utils';
import style from './type.st.css';

const renderObjectKey = (key: string) =>
  isValidJsIdentifier(key) ? key : JSON.stringify(key);

const openingBrace = '{';
const closingBrace = '}';

export const InterfaceTypeView: React.SFC<ISchemaViewProps> = (props) => {
  const {schema} = props;

  const required: string[] = schema.required || [];

  const entries: React.ReactNode[] =
    Object.entries(schema.properties).map(([propName, propSchema]) => {
      const optional = required.includes(propName) ? '' : '?';
      return (
        <React.Fragment key={propName}>
          {renderObjectKey(propName)}{optional}:{' '}
          <BaseView
            schemaRegistry={props.schemaRegistry}
            viewRegistry={props.viewRegistry}
            schema={propSchema}
          />
        </React.Fragment>
      );
    });

  return (
    <div {...style('root', {category: 'interface'}, props)}>
      {openingBrace}{intersperse(entries, ', ')}{closingBrace}
    </div>
  );
};
