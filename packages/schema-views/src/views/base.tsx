import React from 'react';
import {ISchemaViewProps} from '../schema-view';

export const BaseView: React.FunctionComponent<ISchemaViewProps> = (props) => {
  const View = props.viewRegistry.getViewForSchema(props.schema, props.variant);
  return <View {...props} />;
};
