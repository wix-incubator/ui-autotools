import React from 'react';
import {ISchemaViewProps} from '../../schema-view';
import style from './type.st.css';

export const UndefinedTypeView: React.FunctionComponent<ISchemaViewProps> = (props) => (
  <div {...style('root', {category: 'undefined'}, props)}>undefined</div>
);
