import React from 'react';
import {ISchemaViewProps} from '../schema-view';

export const BaseView: React.SFC<ISchemaViewProps> = (props) => {
  const View = props.viewRegistry.getViewForSchema(props.schema);
  return <View {...props} />;
};
