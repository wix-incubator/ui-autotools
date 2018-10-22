import React from 'react';
import {ISchemaViewProps} from '../../schema-view';
import style from './type.st.css';

export const StringTypeView: React.SFC<ISchemaViewProps> = (props) => (
  <div {...style('root', {category: 'string'}, props)}>string</div>
);
