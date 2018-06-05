export const ModuleSchemaId = "common/module";
export const UndefinedSchemaId = "common/UndefinedSchemaId";
export const NullSchemaId = "common/null";




export type ObjectFields = {
    additionalProperties?:Schema
    properties:{[name:string]:Schema}
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
export type PrimitiveTypes = 'string' | 'number' | 'boolean';

export type SchemaTypes = keyof FieldsForType;

export type SchemaBase<T extends  SchemaTypes = SchemaTypes> = {
    title?:string;
    name?:string;
    description?:string;
    type?:T | T[];
    $ref?:string
}

export type Schema<T extends  SchemaTypes = SchemaTypes> = SchemaBase & FieldsForType[T];

export type ModuleSchema<T extends  SchemaTypes = SchemaTypes> = Schema<T> & {
    "$schema": "http://json-schema.org/draft-06/schema#",
    "$id":string,
    "$ref":typeof ModuleSchemaId,
    "definitions"?:{[name:string]:Schema}
}