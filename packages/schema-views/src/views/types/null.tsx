import React from 'react';
import {ISchemaViewProps} from '../../schema-view';
import style from './type.st.css';

export const NullTypeView: React.SFC<ISchemaViewProps> = (props) => (
  <div {...style('root', {category: 'null'}, props)}>null</div>
);
