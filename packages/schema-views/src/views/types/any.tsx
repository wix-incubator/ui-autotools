import React from 'react';
import {ISchemaViewProps} from '../../schema-view';
import style from './type.st.css';

export const AnyTypeView: React.SFC<ISchemaViewProps> = (props) => (
  <div {...style('root', {category: 'any'}, props)}>any</div>
);
