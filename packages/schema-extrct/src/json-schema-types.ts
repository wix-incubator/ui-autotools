export const ModuleSchemaId = 'common/module';
export const FunctionSchemaId = 'common/function';
export const ClassSchemaId = 'common/class';
export const ClassConstructorSchemaId = 'common/class_constructor';
export const UndefinedSchemaId = 'common/undefined';
export const NullSchemaId = 'common/null';

export interface IObjectFields {
    additionalProperties?: Schema;
    properties?: {[name: string]: Schema};
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
    items: Schema | Schema[];
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
    default?: ITypeMap[T];
}

export type Schema<T extends  SchemaTypes = SchemaTypes> = ISchemaBase & IFieldsForType[T];

export type ModuleSchema<T extends  SchemaTypes = SchemaTypes> = Schema<T> & {
    '$schema': 'http://json-schema.org/draft-06/schema#',
    '$id': string,
    '$ref': typeof ModuleSchemaId,
    'definitions'?: {[name: string]: Schema},
};

export type FunctionSchema = Schema & {
    $ref: typeof FunctionSchemaId;
    arguments: Schema[],
    restArgument?: Schema<'array'>,
    returns: Schema
};

export type ClassConstructorSchema = Schema & {
    $ref: typeof ClassConstructorSchemaId;
    arguments: Schema[];
    restArgument?: Schema<'array'>;
    returns: Schema;
    properties: {[name: string]: Schema};
    extends?: Schema
};

export type ClassSchema = Schema & {
    $ref: typeof ClassSchemaId;
    constructor: Schema;
    extends?: Schema;
    implements?: Schema[];
    properties: {[name: string]: Schema};
};

export type ClassConstructorPairSchema = Schema & {
    class_def: ClassSchema;
    constructor_def: ClassConstructorSchema;
};

export function isSchemaOfType<T extends SchemaTypes>(t: T, s: object): s is Schema<T> {
    return (s as any).type === t;
}
