export const ModuleSchemaId = 'common/module';
export const FunctionSchemaId = 'common/function';
export const ClassSchemaId = 'common/class';
export const ClassConstructorSchemaId = 'common/class_constructor';
export const UndefinedSchemaId = 'common/undefined';
export const NullSchemaId = 'common/null';
export const PromiseId = 'common/promise';
export const JSXElement = 'common/JSX';
export const NeverId = 'common/never';
export const UnknownId = 'common/unknown';
export const interfaceId = 'common/interface';

export interface IObjectFields {
    additionalProperties?: Schema;
    properties?: {[name: string]: Schema};
    required?: string[];
    propertyNames?: Schema<'string'>;
}

// tslint:disable-next-line:no-empty-interface
export interface IStringFields {
}

// tslint:disable-next-line:no-empty-interface
export interface INumberFields {
}

// tslint:disable-next-line:no-empty-interface
export interface IBooleanFields {
}

export interface IArrayFields {
    items?: Schema | Schema[];
}

export interface IFieldsForType {
    string: IStringFields;
    number: INumberFields;
    boolean: IBooleanFields;
    array: IArrayFields;
    object: IObjectFields;
}

export interface ITypeMap {
    string: string;
    number: number;
    boolean: boolean;
    array: any[];
    object: {};
}

export type PrimitiveTypes = 'string' | 'number' | 'boolean';

export type SchemaTypes = keyof IFieldsForType;

export interface ISchemaBase<T extends  SchemaTypes = SchemaTypes> {
    title?: string;
    name?: string;
    description?: string;
    type?: T | T[];
    $ref?: string;
    $oneOf?: Schema[];
    enum?: any[];
    $allOf?: Schema[];
    genericParams?: Schema[];
    genericArguments?: Schema[];
    inheritedFrom?: string;
    definedAt?: string;
    default?: ITypeMap[T];
    initializer?: string;
}

export type Schema<T extends  SchemaTypes = SchemaTypes> = ISchemaBase & IFieldsForType[T];

export type ModuleSchema<T extends  SchemaTypes = SchemaTypes> = Schema<T> & {
    '$schema': 'http://json-schema.org/draft-06/schema#',
    '$id': string,
    '$ref': typeof ModuleSchemaId,
    'definitions'?: {[name: string]: Schema},
};

export type FunctionSchema = Schema & {
    $ref: typeof FunctionSchemaId | typeof ClassConstructorSchemaId;
    arguments: Schema[],
    restArgument?: Schema<'array'>,
    requiredArguments?: string[],
    returns?: Schema
};

export type InterfaceSchema = Schema & {
    $ref: typeof interfaceId;
    properties?: {[name: string]: Schema};
    extends?: Schema;
};

export type ClassSchema = Schema & {
    $ref: typeof ClassSchemaId;
    constructor?: FunctionSchema;
    extends?: Schema;
    implements?: Schema[];
    properties: {[name: string]: Schema};
    staticProperties: {[name: string]: Schema};
};

export function isSchemaOfType<T extends SchemaTypes>(t: T, s: object): s is Schema<T> {
    return (s as any).type === t;
}

export function isRef(schema: Schema): schema is Schema & {$ref: string} {
    return !!schema && !!schema.$ref;
}

export function isClassSchema(schema: Schema): schema is ClassSchema {
    return !!schema && !!schema.$ref && schema.$ref === ClassSchemaId;
}

export function isInterfaceSchema(schema: Schema): schema is InterfaceSchema {
    return !!schema && !!schema.$ref && schema.$ref === interfaceId;
}
