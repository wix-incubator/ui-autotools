import React from 'react';
import {intersperse} from '../../utils';
import {ISchemaViewProps} from '../../schema-view';
import {Schema} from '../../schema';
import {isVoid} from '../../schema-predicates';
import {BaseView} from '../base';
import style from './type.st.css';

export const FunctionTypeView: React.FunctionComponent<ISchemaViewProps> = (props) => {
  const {schema} = props;
  const required = schema.requiredArguments || [];
  const args = schema.arguments.map((arg: Schema, index:number) => {
    const optional = required.includes(arg.name) ? '' : '?';
    const argName = arg.name + optional;
    return <>{argName}: <BaseView
      schemaRegistry={props.schemaRegistry}
      viewRegistry={props.viewRegistry}
      schema={arg}
    /></>
  });
  const restArg = schema.restArgument;
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
  const commaSeparatedArgs = intersperse(args, ', ');
  return (
    <div {...style('root', {category: 'function'}, props)}>
      ({commaSeparatedArgs}) => {
        isVoid(schema.returns) ? 'void' : 
          (<BaseView
            schemaRegistry={props.schemaRegistry}
            viewRegistry={props.viewRegistry}
            schema={schema.returns}
          />)}
    </div>
  );
}
