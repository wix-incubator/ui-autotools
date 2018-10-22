import React from 'react';
import {intersperse} from '../../utils';
import {ISchemaViewProps} from '../../schema-view';
import {Schema} from '../../schema';
import {isVoid} from '../../schema-predicates';
import {BaseView} from '../base';
import style from './type.st.css';

export const FunctionTypeView: React.SFC<ISchemaViewProps> = (props) => {
  const {schema} = props;
  const restArg = schema.restArgument;
  const required = schema.requiredArguments || [];
  const returnTypeJsx = isVoid(schema.returns) ?
    'void' :
    (
      <BaseView
        schemaRegistry={props.schemaRegistry}
        viewRegistry={props.viewRegistry}
        schema={schema.returns}
      />
    );

  const args = schema.arguments.map((arg: Schema) => {
    const optional = required.includes(arg.name) ? '' : '?';
    return [
      arg.name + optional + ': ',
      (
        <BaseView
          schemaRegistry={props.schemaRegistry}
          viewRegistry={props.viewRegistry}
          schema={arg}
        />
      )
    ];
  });

  if (restArg) {
    args.push([
      `...${restArg.name}: `,
      (
        <BaseView
          schemaRegistry={props.schemaRegistry}
          viewRegistry={props.viewRegistry}
          schema={restArg}
        />
      )
    ]);
  }

  const commaSeparatedArgs = React.Children.toArray(intersperse(args, ', '));

  return (
    <div {...style('root', {category: 'function'}, props)}>
      ({commaSeparatedArgs}) => {returnTypeJsx}
    </div>
  );
};
