import * as ts from 'typescript';
import {union} from 'lodash';
import { transform } from '../src/file-transformer';
import { Schema, IObjectFields, ClassSchemaId, ClassSchema, ModuleSchema, isRef, isSchemaOfType, isClassSchema, NeverId } from './json-schema-types';

export class SchemaLinker {
    private checker: ts.TypeChecker;
    private program: ts.Program;

    constructor(program: ts.Program, checker: ts.TypeChecker) {
        this.checker = checker;
        this.program = program;
    }

    public flatten(file: string, entityName: string, fileName: string, projectPath: string): Schema {
        const schema = transform(this.checker, this.program.getSourceFile(file)!, '/src/' + fileName, projectPath);
        let entity;
        if (schema.definitions) {
            entity = schema.definitions[entityName];
        } else if (schema.properties) {
            entity = schema.properties[entityName];
        }
        if (!entity) {
            return {};
        }
        return this.link(entity, schema);
    }

    private getSchemaFromImport(path: string, ref: string): ModuleSchema | null {
        const importSourceFile = this.program.getSourceFile('/someProject' + path);
        if (!importSourceFile) {
            return null;
        }
        return transform(this.checker, importSourceFile , path + ref, path);
    }

    private link(entity: Schema, schema: ModuleSchema): Schema {
        if (isClassSchema(entity)) {
            return this.linkClass(schema, entity);
        }
        if (isRef(entity)) {
            return this.handleRef(entity, schema);
        }
        if (entity.$allOf) {
            const res = this.handleIntersection(entity.$allOf, schema);
            res.type = 'object';
            return res;
        }
        if (entity.$oneOf) {
            const res: Schema = {type: 'object', $oneOf: []};
            for (const type of entity.$oneOf) {
                res.$oneOf!.push(this.link(type, schema));
            }
            return res;
        }
        if (isSchemaOfType('object', entity)) {
            return this.handleObject(entity, schema);
        }
        return entity;
    }

    private handleRef(entity: Schema & {$ref: string}, schema: ModuleSchema) {
        const ref = entity.$ref;
        const poundIndex = entity.$ref.indexOf('#');
        const entityType = ref.slice(poundIndex + 1);
        let refEntity = schema.definitions![ref.replace('#', '')];
        if (!refEntity) {
                const importSchema = this.getSchemaFromImport(ref.slice(0, poundIndex), ref.slice(poundIndex + 1));
                if (importSchema) {
                    refEntity = importSchema.definitions![entityType];
                }
                // Ifception
                if (!refEntity) {
                    return entity;
                }
            }
        if (!refEntity.genericParams || !entity.genericArguments) {
                return refEntity;
            }
        if (isSchemaOfType('object', refEntity)) {
            const pMap = new Map();
            refEntity.genericParams!.forEach((param, index) => {
                pMap.set(`#${entityType}!${param.name}`, entity.genericArguments![index]);
            });
            return this.linkObject(refEntity, pMap, schema);
        } else {
            return entity;
        }
    }

    private handleIntersection(options: Schema[], schema: ModuleSchema, paramsMap?: Map<string, Schema>): Schema {
        const res: Schema & IObjectFields = {};
        for (const option of options) {
            // Refactor this part, there are duplications here
            if (isRef(option)) {
                let entity: Schema & IObjectFields;
                if (paramsMap) {
                    entity = paramsMap!.get(option.$ref)!;
                    if (!entity) {
                        return res;
                    }
                } else {
                    const refEntity = option.genericArguments ? option : schema.definitions![option.$ref!.replace('#', '')];
                    entity = this.link(refEntity, schema);
                }
                /*

                What about additionalProperties????

                */
                this.mergeProperties(entity, res, schema, paramsMap);
            } else if (isSchemaOfType('object', option) && !option.$oneOf) {
                this.mergeProperties(option, res, schema, paramsMap);
            } else {
                const prop = option.$oneOf ? option.$oneOf[0] : option;
                //There is probably a bug here

                if (!res.type && prop.type) {
                    res.type = prop.type;
                    if (prop.enum) {
                        res.enum = prop.enum;
                    }
                } else {
                    if (prop.type === res.type) {
                        if (prop.enum) {
                            // can enum have an arrays. something like type x = ['gaga']?
                            if (!res.enum) {
                                res.enum = prop.enum;
                            } else {
                                const enums = [];
                                for (let i = 0; i < prop.enum.length; i++) {
                                    if (prop.enum.includes(res.enum![i])) {
                                        enums.push(prop.enum[i]);
                                    }
                                }
                                if (enums.length === 0) {
                                    return {$ref: NeverId};
                                } else {
                                    res.enum = enums;
                                }
                            }
                        }
                    } else {
                        return {$ref: NeverId};
                    }
                }
            }
        }
        return res;
    }

    private mergeProperties(entity: Schema & IObjectFields, res: Schema & IObjectFields, schema: ModuleSchema, paramsMap?: Map<string, Schema>) {
        if (!res.properties) {
            res.properties = {};
        }
        if (entity.properties) {
            res.type = entity.type;
            const properties = entity.properties;
            for (const prop in properties) {
                if (!res.properties.hasOwnProperty(prop)) {
                    res.properties[prop] = this.link(properties[prop], schema);
                } else {
                    res.properties[prop] = this.handleIntersection([res.properties![prop], properties[prop]], schema, paramsMap);
                }
            }
        }
        if (entity.required) {
            if (!res.required) {
                res.required = entity.required;
            } else {
                res.required = union(res.required, entity.required);
            }
        }
    }

    private linkClass(schema: ModuleSchema, entity: ClassSchema): ClassSchema {
        if (!schema.definitions || !entity.extends) {
            return entity;
        }
        const extendedEntity = entity.extends.$ref!.replace('#', '');
        const refEntity = schema.definitions[extendedEntity] as ClassSchema;
        const res = {
            $ref: ClassSchemaId,
            extends: {$ref: entity.extends.$ref},
            properties: {},
            staticProperties: {}
        } as ClassSchema;
        if (entity.hasOwnProperty('constructor')) {
            res.constructor = Object.assign({}, entity.constructor);
        } else if (refEntity.hasOwnProperty('constructor')) {
            res.constructor = Object.assign({}, refEntity.constructor);
        }
        res.properties = this.extractClassData(entity, refEntity, extendedEntity, 'properties');
        res.staticProperties = this.extractClassData(entity, refEntity, extendedEntity, 'staticProperties');
        if (entity.genericParams) {
            res.genericParams = entity.genericParams;
        }
        return res;
    }

    private extractClassData(entity: ClassSchema, refEntity: ClassSchema, extendedEntity: string, prop: 'properties' | 'staticProperties'): {[name: string]: Schema} {
        const res: {[name: string]: Schema & {inheritedFrom?: string}} = {};
        const paramsMap = new Map();
        if (refEntity.genericParams) {
            refEntity.genericParams!.forEach((param, index) => {
                paramsMap.set(`#${extendedEntity}!${param.name}`, entity.extends!.genericArguments![index]);
            });
        }
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
                    const property = refProperties[p];
                    if (isRef(property)) {
                        const refType = property.$ref.startsWith(`#${extendedEntity}`) ? property.$ref : `#${extendedEntity}!${property.$ref.replace('#', '')}`;
                        res[p] = Object.assign({inheritedFrom: `#${extendedEntity}`}, paramsMap.get(refType));
                    } else {
                        res[p] = Object.assign({inheritedFrom: `#${extendedEntity}`}, refProperties[p]);
                    }
                } else {
                    res[p].inheritedFrom = `#${extendedEntity}`;
                }
            }
        }
        return res;
    }

    private linkObject(refEntity: Schema & IObjectFields, paramsMap: Map<string, Schema>, schema: ModuleSchema): Schema {
        const res: typeof refEntity = {};
        res.type = refEntity.type;
        const refProperties = refEntity.properties;
        if (!refProperties) {
            return res;
        }
        const properties: typeof refProperties = {};
        for (const propName in refProperties) {
            if (refProperties.hasOwnProperty(propName)) {
                const property = refProperties[propName];
                if (isRef(property)) {
                    properties[propName] = paramsMap.get(property.$ref)!;
                } else if (property.$allOf) {
                    properties[propName] = this.handleIntersection(property.$allOf, schema, paramsMap);
                } else {
                    if (isSchemaOfType('object', property)) {
                        properties[propName] = this.linkObject(property, paramsMap, schema);
                    }
                }
            }
        }
        res.properties = properties;
        if (refEntity.required) {
            res.required = refEntity.required;
        }
        return res;
    }

    private handleObject(entity: Schema & IObjectFields, schema: ModuleSchema): Schema {
        const res: typeof entity = {};
        res.type = entity.type;
        this.mergeProperties(entity, res, schema);
        return res;
    }
}
