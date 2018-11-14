import React from 'react';
import {ISchemaViewProps} from '../../schema-view';
import style from './type.st.css';

export const NumberTypeView: React.FunctionComponent<ISchemaViewProps> = (props) => (
  <div {...style('root', {category: 'number'}, props)}>number</div>
);
