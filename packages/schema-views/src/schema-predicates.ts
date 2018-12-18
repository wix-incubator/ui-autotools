import {Schema} from './schema';

export type SchemaPredicate = (schema: Schema) => boolean;

export const catchAll: SchemaPredicate = () => true;

export const isAny: SchemaPredicate = (schema) =>
  Object.keys(schema).length === 0;

export const isNull: SchemaPredicate = (schema) =>
  schema.$ref === 'common/null';

export const isUndefined: SchemaPredicate = (schema) =>
  schema.$ref === 'common/undefined';

export const isVoid = isUndefined; // applicable only to return types

export const isBoolean: SchemaPredicate = (schema) =>
  schema.type === 'boolean' && !schema.enum;

export const isNumber: SchemaPredicate = (schema) =>
  schema.type === 'number' && !schema.enum;

export const isString: SchemaPredicate = (schema) =>
  schema.type === 'string' && !schema.enum;

export const isArray: SchemaPredicate = (schema) =>
  schema.type === 'array';

export const isObject: SchemaPredicate = (schema) =>
  schema.type === 'object';

export const isPrimitiveUnion: SchemaPredicate = (schema) =>
  Boolean(schema.enum);

export const isNonPrimitiveUnion: SchemaPredicate = (schema) =>
  Boolean(schema.$oneOf);

export const isUnion: SchemaPredicate = (schema) =>
  isPrimitiveUnion(schema) || isNonPrimitiveUnion(schema);

export const isFunction: SchemaPredicate = (schema) =>
  schema.$ref === 'common/function' ||
  schema.$ref === 'common/class_constructor';

export const isInterface: SchemaPredicate = (schema) =>
  schema.$ref === 'common/interface';

export const isSimpleType: SchemaPredicate = (schema) =>
  isAny(schema)     || isNull(schema)   || isUndefined(schema) ||
  isBoolean(schema) || isNumber(schema) || isString(schema);

export const isModule: SchemaPredicate = (schema) =>
  schema.$ref === 'common/module';
