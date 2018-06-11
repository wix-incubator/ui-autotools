export const ModuleSchemaId = "common/module";
export const FunctionSchemaId = "common/function";
export const UndefinedSchemaId = "common/UndefinedSchemaId";
export const NullSchemaId = "common/null";




export type ObjectFields = {
    additionalProperties?:Schema
    properties?:{[name:string]:Schema}
}  


export type StringFields = {
}  


export type NumberFields = {
}  


export type BooleanFields = {
}  


export type ArrayFields = {
    items:Schema | Schema[]
}

export type FieldsForType = {
    string:StringFields;
    number:NumberFields;
    boolean:BooleanFields
    array:ArrayFields
    object:ObjectFields
}

export type TypeMap = {
    string:string;
    number:number;
    boolean:boolean
    array:Array<any>
    object:{}
}

export type PrimitiveTypes = 'string' | 'number' | 'boolean';

export type SchemaTypes = keyof FieldsForType;

export type SchemaBase<T extends  SchemaTypes = SchemaTypes> = {
    title?:string;
    name?:string;
    description?:string;
    type?:T | T[];
    $ref?:string
    $oneOf?:Schema[];
    enum?:any[],
    $allOf?:Schema[];
    default?:TypeMap[T]
}

export type Schema<T extends  SchemaTypes = SchemaTypes> = SchemaBase & FieldsForType[T];

export type ModuleSchema<T extends  SchemaTypes = SchemaTypes> = Schema<T> & {
    "$schema": "http://json-schema.org/draft-06/schema#",
    "$id":string,
    "$ref":typeof ModuleSchemaId,
    "definitions"?:{[name:string]:Schema}
}

export type FunctionSchema = Schema & {
    $ref:typeof FunctionSchemaId;
    arguments:Schema[],
    returns:Schema
}

export function isSchemaOfType<T extends SchemaTypes>(t:T, s:Object): s is Schema<T>{
    return (s as any).type === t;
}