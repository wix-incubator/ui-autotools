import React from 'react';
import { classes } from './type-definition.st.css';
import type { ICodeSchema, IFunctionSchema } from '@wix/typescript-schema-extract';

export type TypeRenderer = (schema: ICodeSchema) => React.ReactNode;

// Ex: intersperse([1, 2, 3, 4], 0)  ⇨  [1, 0, 2, 0, 3, 0, 4]
function intersperse<T, U>(items: T[], separator: U) {
  const result: (T | U)[] = [];
  for (const item of items) {
    result.push(item);
    result.push(separator);
  }
  result.pop();
  return result;
}

const isAnyType = (schema: ICodeSchema) => Object.keys(schema).length === 0;

const isNullType = (schema: ICodeSchema) => schema.$ref === 'common/null';

const isUndefinedType = (schema: ICodeSchema) => schema.$ref === 'common/undefined';

const isVoidType = isUndefinedType; // applicable only to return types

const isBooleanType = (schema: ICodeSchema) => schema.type === 'boolean' && !schema.enum;

const isNumberType = (schema: ICodeSchema) => schema.type === 'number' && !schema.enum;

const isStringType = (schema: ICodeSchema) => schema.type === 'string' && !schema.enum;

const isArrayType = (schema: ICodeSchema) => schema.type === 'array';

const isObjectType = (schema: ICodeSchema) => schema.type === 'object';

const isPrimitiveUnionType = (schema: ICodeSchema) => Boolean(schema.enum);

const isNonPrimitiveUnionType = (schema: ICodeSchema) => Boolean(schema.oneOf);

const isFunctionType = (schema: ICodeSchema): schema is IFunctionSchema =>
  schema.$ref === 'common/function' || schema.$ref === 'common/class_constructor';

const isSimpleType = (schema: ICodeSchema) =>
  isAnyType(schema) ||
  isNullType(schema) ||
  isUndefinedType(schema) ||
  isBooleanType(schema) ||
  isNumberType(schema) ||
  isStringType(schema);

const renderPrimitiveUnion: TypeRenderer = (schema) => {
  const parts = schema.enum!.map((val) => JSON.stringify(val));
  return intersperse(parts, ' | ');
};

const renderNonPrimitiveUnion: TypeRenderer = (schema) => {
  const parts = schema.oneOf!.flatMap((itemSchema) =>
    itemSchema.enum ? itemSchema.enum.map((val) => JSON.stringify(val)) : [renderType(itemSchema)]
  );

  return React.Children.toArray(intersperse(parts, ' | '));
};

const renderFunction = (schema: IFunctionSchema) => {
  const restArg = schema.restArgument;
  const required = schema.requiredArguments || [];
  const returnType = isVoidType(schema.returns!) ? 'void' : renderType(schema.returns!);

  const args = schema.arguments.map((arg) => {
    const optional = required.includes(arg.name!) ? '' : '?';
    return [arg.name! + optional + ': ', renderType(arg)] as [string, React.ReactNode];
  });

  if (restArg) {
    args.push([`...${restArg.name!}: `, renderType(restArg)]);
  }

  const commaSeparatedArgs = React.Children.toArray(intersperse(args, ', '));

  return (
    <>
      ({commaSeparatedArgs}) =&gt; {returnType}
    </>
  );
};

const renderObjectKey = (key: string): string => (/^[a-z_$][a-z_$0-9]*$/i.test(key) ? key : JSON.stringify(key));

const renderObject: TypeRenderer = (schema) => {
  const required: string[] = schema.required || [];

  const entries: React.ReactNode[] = Object.entries(schema.properties!).map(([key, val]) => {
    const optional = required.includes(key) ? '' : '?';
    return (
      <React.Fragment key={key}>
        {renderObjectKey(key)}
        {optional}: {renderType(val)}
      </React.Fragment>
    );
  });

  return (
    <>
      {'{'}
      {intersperse(entries, ', ')}
      {'}'}
    </>
  );
};

const renderArray: TypeRenderer = (schema) => {
  const renderedItemType = renderType(schema.items as ICodeSchema);

  return isSimpleType(schema.items as ICodeSchema) ? (
    <>{renderedItemType}[]</>
  ) : (
    <>
      Array{'<'}
      {renderedItemType}
      {'>'}
    </>
  );
};

const renderUnknown: TypeRenderer = (schema) => {
  const renderedType = schema.$ref || schema.definedAt || schema.type || JSON.stringify(schema);

  return <span className={classes.typeError}>{renderedType}</span>;
};

const renderType: TypeRenderer = (schema) => {
  if (isAnyType(schema)) {
    return 'any';
  }

  if (isNullType(schema)) {
    return 'null';
  }

  if (isUndefinedType(schema)) {
    return 'undefined';
  }

  if (isBooleanType(schema)) {
    return 'boolean';
  }

  if (isNumberType(schema)) {
    return 'number';
  }

  if (isStringType(schema)) {
    return 'string';
  }

  if (isArrayType(schema)) {
    return renderArray(schema);
  }

  if (isObjectType(schema)) {
    return renderObject(schema);
  }

  if (isPrimitiveUnionType(schema)) {
    return renderPrimitiveUnion(schema);
  }

  if (isNonPrimitiveUnionType(schema)) {
    return renderNonPrimitiveUnion(schema);
  }

  if (isFunctionType(schema)) {
    return renderFunction(schema);
  }

  return renderUnknown(schema);
};

export const TypeDefinition: React.FunctionComponent<{ schema: ICodeSchema }> = (props) => {
  return <>{renderType(props.schema)}</>;
};
