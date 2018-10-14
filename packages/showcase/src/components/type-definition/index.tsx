import React from 'react';
import style from './type-definition.st.css';

// TODO: we should instead use the Schema type from schema-extract, but
// it's currently not complete and many valid combinations of properties don't
// typecheck.
export type Schema = any;

type TypeRenderer = (schema: Schema) => React.ReactNode;

// Ex: intersperse([1, 2, 3, 4], 0)  ⇨  [1, 0, 2, 0, 3, 0, 4]
function intersperse<T>(items: T[], separator: T) {
  const result: T[] = [];
  for (const item of items) {
    result.push(item);
    result.push(separator);
  }
  result.pop();
  return result;
}

const isAnyType = (schema: Schema) =>
  Object.keys(schema).length === 0;

const isNullType = (schema: Schema) =>
  schema.$ref === 'common/null';

const isUndefinedType = (schema: Schema) =>
  schema.$ref === 'common/undefined';

const isVoidType = isUndefinedType; // applicable only to return types

const isBooleanType = (schema: Schema) =>
  schema.type === 'boolean' && !schema.enum;

const isNumberType = (schema: Schema) =>
  schema.type === 'number' && !schema.enum;

const isStringType = (schema: Schema) =>
  schema.type === 'string' && !schema.enum;

const isArrayType = (schema: Schema) =>
  schema.type === 'array';

const isObjectType = (schema: Schema) =>
  schema.type === 'object';

const isPrimitiveUnionType = (schema: Schema) =>
  Boolean(schema.enum);

const isNonPrimitiveUnionType = (schema: Schema) =>
  Boolean(schema.$oneOf);

const isFunctionType = (schema: Schema) =>
  schema.$ref === 'common/function' ||
  schema.$ref === 'common/class_constructor';

const isSimpleType = (schema: Schema) =>
  isAnyType(schema)     || isNullType(schema)   || isUndefinedType(schema) ||
  isBooleanType(schema) || isNumberType(schema) || isStringType(schema);

const renderPrimitiveUnion: TypeRenderer = (schema) => {
  const parts = schema.enum.map(JSON.stringify);
  return intersperse(parts, ' | ');
};

const renderNonPrimitiveUnion: TypeRenderer = (schema) => {
  const parts = schema.$oneOf.flatMap((itemSchema: Schema) => (
    itemSchema.enum ?
      itemSchema.enum.map(JSON.stringify) :
      [renderType(itemSchema)]
  ));

  return React.Children.toArray(intersperse(parts, ' | '));
};

const renderFunction: TypeRenderer = (schema) => {
  const restArg = schema.restArgument;
  const required = schema.requiredArguments || [];
  const returnType = isVoidType(schema.returns) ?
    'void' :
    renderType(schema.returns);

  const args = schema.arguments.map((arg: Schema) => {
    const optional = required.includes(arg.name) ? '' : '?';
    return [arg.name + optional + ': ', renderType(arg)];
  });

  if (restArg) {
    args.push([`...${restArg.name}: `, renderType(restArg)]);
  }

  const commaSeparatedArgs = React.Children.toArray(intersperse(args, ', '));

  return <>({commaSeparatedArgs}) => {returnType}</>;
};

const renderObjectKey = (key: string): string =>
  /^[a-z_$][a-z_$0-9]*$/i.test(key) ? key : JSON.stringify(key);

const renderObject: TypeRenderer = (schema) => {
  const required: string[] = schema.required || [];

  const entries: React.ReactNode[] =
    Object.entries(schema.properties).map(([key, val]) => {
      const optional = required.includes(key) ? '' : '?';
      return (
        <React.Fragment key={key}>
          {renderObjectKey(key)}{optional}: {renderType(val)}
        </React.Fragment>
      );
    });

  return <>{'{'}{intersperse(entries, ', ')}{'}'}</>;
};

const renderArray: TypeRenderer = (schema) => {
  const renderedItemType = renderType(schema.items);

  return isSimpleType(schema.items) ?
    <>{renderedItemType}[]</> :
    <>Array{'<'}{renderedItemType}{'>'}</>;
};

const renderUnknown: TypeRenderer = (schema) => {
  const renderedType = (
    schema.$ref ||
    schema.definedAt ||
    schema.type ||
    JSON.stringify(schema)
  );

  return <span className={style.typeError}>{renderedType}</span>;
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

export const TypeDefinition: React.SFC<{schema: Schema}> = (props) => {
  return <>{renderType(props.schema)}</>;
};
