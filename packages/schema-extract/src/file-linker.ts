import * as ts from 'typescript';
import { transform } from '../src/file-transformer';
import { Schema, IObjectFields, ClassSchemaId, ClassSchema, ModuleSchema } from './json-schema-types';

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
        if (!entity) {
            return {};
        }
        if (isClassSchema(entity)) {
            return linkClass(schema, entity);
        }
        if (isRef(entity)) {
            // need to slice according to #?
            const entityType = entity.$ref.replace('#', '');
            const refEntity = schema.definitions[entityType];
            if (!refEntity.genericParams || !entity.genericArguments) {
                return entity;
            }
            if (isObjectSchema(refEntity)) {
                const paramsMap = (refEntity.genericParams as Schema[]).map((param) => `#${entityType}!${param.name}`);
                return linkObject(entity, entityType, refEntity, paramsMap);
            } else {
                return entity;
            }
        } else {
            return entity;
        }
    }
}

function linkClass(schema: ModuleSchema, entity: ClassSchema): ClassSchema {
    if (!schema.definitions || !entity.extends) {
        return entity;
    }
    const extendedEntity = entity.extends.$ref!.replace('#', '');
    const refEntity = schema.definitions[extendedEntity] as ClassSchema;
    const res = {
        $ref: ClassSchemaId,
        constructor: entity.hasOwnProperty('constructor') ? Object.assign({}, entity.constructor) : Object.assign({}, refEntity.constructor),
        extends: Object.assign({}, entity.extends),
        properties: {},
        staticProperties: {}
    } as ClassSchema;
    res.properties = extractClassData(entity, refEntity, extendedEntity, 'properties');
    res.staticProperties = extractClassData(entity, refEntity, extendedEntity, 'staticProperties');
    return res;
}

function linkObject(entity: Schema, entityType: string, refEntity: Schema & IObjectFields, paramsMap: string[]): Schema {
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
                    properties[pArray] = linkObject(entity, entityType, property, paramsMap);
                }
            }
        }
    }
    res.properties = properties;
    return res;
}

function extractClassData(entity: ClassSchema, refEntity: ClassSchema, extendedEntity: string, prop: 'properties' | 'staticProperties'): {[name: string]: Schema} {
    const res: {[name: string]: Schema & {inheritedFrom?: string}} = {};
    const refProperties = refEntity[prop];
    const properties = entity[prop];
    for (const p in properties) {
        if (properties.hasOwnProperty(p)) {
            res[p] = Object.assign({}, properties[p]);
        }
    }
    for (const p in refProperties) {
        if (refProperties.hasOwnProperty(p)) {
            if (!properties.hasOwnProperty(p)) {
                const o = Object.assign({inheritedFrom: `#${extendedEntity}`}, refProperties[p]);
                res[p] = o;
            } else {
                res[p].inheritedFrom = `#${extendedEntity}`;
            }
        }
    }
    return res;
}

function isRef(schema: Schema): schema is Schema & {$ref: string} {
    return !!schema.$ref;
}

function isObjectSchema(schema: Schema): schema is Schema & IObjectFields {
    return schema.type === 'object';
}

function isClassSchema(schema: Schema): schema is Schema & ClassSchema {
    return !!schema.$ref && schema.$ref === ClassSchemaId;
}
