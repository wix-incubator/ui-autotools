import * as ts from 'typescript';
import { transform } from '../src/file-transformer';
import { Schema, IObjectFields } from './json-schema-types';

export class SchemaLinker {
    private checker: ts.TypeChecker;
    private program: ts.Program;

    constructor(program: ts.Program, checker: ts.TypeChecker) {
        this.checker = checker;
        this.program = program;
    }

    public flatten(file: string, name: string, moduleId: string): Schema {
        const schema = transform(this.checker, this.program.getSourceFile(file)!, '/src/' + moduleId, '/someProject');
        if (!schema.definitions) {
            return {};
        }
        const entity = schema.definitions[name];
        if (isRef(entity)) {
            // need to slice according to #?
            const entityType = entity.$ref.replace('#', '');
            const refEntity = schema.definitions[entityType];
            if (!refEntity.genericParams || !entity.genericArguments) {
                return refEntity;
            }
            if (isObjectSchema(refEntity)) {
                const paramsMap = (refEntity.genericParams as Schema[]).map((param) => `#${entityType}!${param.name}`);
                return describeObject(entity, entityType, refEntity, paramsMap);
            }
            return refEntity;
        } else {
            return {};
        }
    }
}

function describeObject(entity: Schema, entityType: string, refEntity: Schema & IObjectFields, paramsMap: string[]) {
    const res: typeof refEntity = {};
    res.type = refEntity.type;
    const refProperties = refEntity.properties;
    if (!refProperties) {
        return res;
    }
    const argsMap = entity.genericArguments || [];
    const properties: {[name: string]: Schema} = {};
    for (const pArray in refProperties) {
        if (refProperties.hasOwnProperty(pArray)) {
            const property = refProperties[pArray];
            if (isRef(property)) {
                const argIndex = paramsMap.indexOf(refProperties[pArray].$ref!);
                const type = argsMap[argIndex];
                properties[pArray] = type;
            } else {
                if (isObjectSchema(property)) {
                    properties[pArray] = describeObject(entity, entityType, property, paramsMap);
                }
            }
        }
    }
    res.properties = properties;
    return res;
}

function isRef(schema: Schema): schema is Schema & {$ref: string} {
    return !!schema.$ref;
}

function isObjectSchema(schema: Schema): schema is Schema & IObjectFields {
    return schema.type === 'object';
}
