import React from 'react';
import {ISchemaViewProps} from '../../schema-view';
import style from './type.st.css';

export const FallbackTypeView: React.SFC<ISchemaViewProps> = (props) => (
  <div {...style('root', {category: 'fallback'}, props)}>
    {JSON.stringify(props.schema)}
  </div>
);
