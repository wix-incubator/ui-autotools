import * as ts from 'typescript';
import {union} from 'lodash';
import { transform } from './file-transformer';
import { Schema, IObjectFields, ClassSchemaId, ClassSchema, ModuleSchema, isRef, isSchemaOfType, isClassSchema, NeverId, UnknownId, isInterfaceSchema, InterfaceSchema, interfaceId } from './json-schema-types';

export class SchemaLinker {
    private checker: ts.TypeChecker;
    private program: ts.Program;
    private projectPath: string;
    private sourceFile: ts.SourceFile | undefined;

    constructor(program: ts.Program, checker: ts.TypeChecker, projectPath: string) {
        this.checker = checker;
        this.program = program;
        this.projectPath = projectPath;
    }

    public flatten(file: string, entityName: string): Schema {
        const sourceFile = this.program.getSourceFile(file);
        if (!sourceFile) {
            return {$ref: UnknownId};
        }
        this.sourceFile = sourceFile;
        const schema = transform(this.checker, sourceFile, file, this.projectPath);
        let entity;
        if (schema.definitions) {
            entity = schema.definitions[entityName];
        } else if (schema.properties) {
            entity = schema.properties[entityName];
        }
        if (!entity) {
            return {$ref: UnknownId};
        }
        return this.link(entity, schema);
    }

    private getRefEntity(ref: string, schema: ModuleSchema, paramsMap?: Map<string, Schema>) {
        if (!schema.definitions) {
            return null;
        }
        let refEntity = (paramsMap && paramsMap.has(ref)) ? paramsMap.get(ref) : schema.definitions![ref.replace('#', '')];
        if (!refEntity) {
            const poundIndex = ref.indexOf('#');
            const entityType = ref.slice(poundIndex + 1);
            const importSchema = this.getSchemaFromImport(ref.slice(0, poundIndex), ref.slice(poundIndex + 1));
            if (importSchema && importSchema.definitions) {
                refEntity = importSchema.definitions![entityType];
            }
        }
        return refEntity ? refEntity : null;
    }

    private getSchemaFromImport(path: string, ref: string): ModuleSchema | null {
        const extensions = ['.js', '.d.ts', '.ts', '.tsx'];
        let importSourceFile;
        if (this.sourceFile) {
            /* resolvedModules is an internal ts property that exists on a sourcefile and maps the imports to the path of the imported file
            * This can change in future versions without us knowing but there is no public way of getting this information right now.
            */
            const module = (this.sourceFile as any).resolvedModules && (this.sourceFile as any).resolvedModules.get(path);
            if (module) {
                const newRef = module.resolvedFileName;
                importSourceFile = this.program.getSourceFile(newRef);
                if (importSourceFile) {
                    return transform(this.checker, importSourceFile , path + ref, path);
                }
            }
        }
        for (const extension of extensions) {
            importSourceFile = this.program.getSourceFile(path + extension);
            if (importSourceFile) {
                break;
            }
        }
        if (!importSourceFile) {
            return null;
        }
        return transform(this.checker, importSourceFile , path + ref, path);
    }

    private link(entity: Schema, schema: ModuleSchema): Schema {
        if (!entity) {
            return {$ref: UnknownId};
        }
        if (isClassSchema(entity)) {
            return this.linkClass(schema, entity);
        }
        if (isInterfaceSchema(entity)) {
            return this.linkInterface(entity, schema);
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
            return this.handleUnion(entity.$oneOf, schema);
        }
        if (isSchemaOfType('object', entity)) {
            return this.handleObject(entity, schema);
        }
        return entity;
    }

    private handleRef(entity: Schema & {$ref: string}, schema: ModuleSchema, paramsMap?: Map<string, Schema>) {
        const ref = entity.$ref;
        const entityType = ref.slice(ref.indexOf('#') + 1);
        const refEntity = this.getRefEntity(ref, schema, paramsMap);
        if (!refEntity) {
            return entity;
        }
        if (refEntity.genericParams && entity.genericArguments && isSchemaOfType('object', refEntity)) {
            const pMap = new Map();
            refEntity.genericParams!.forEach((param, index) => {
                pMap.set(`#${entityType}!${param.name}`, entity.genericArguments![index]);
            });
            return this.linkRefObject(refEntity, pMap, schema);
        }
        refEntity.definedAt = '#' + entityType;
        return refEntity;
    }

    private handleIntersection(options: Schema[], schema: ModuleSchema, paramsMap?: Map<string, Schema>): Schema {
        const res: Schema & IObjectFields = {};
        for (const option of options) {
            if (isRef(option)) {
                const entity = this.handleRef(option, schema, paramsMap);
                if (!entity) {
                    return {$ref: UnknownId};
                }
                this.mergeProperties(entity, res, schema, paramsMap);
            } else if (isSchemaOfType('object', option) && !option.$oneOf) {
                this.mergeProperties(option, res, schema, paramsMap);
            } else {
                const prop = option.$oneOf ? option.$oneOf[0] : option;
                if (!res.type && prop.type) {
                    res.type = prop.type;
                    if (prop.enum) {
                        res.enum = prop.enum;
                    }
                } else {
                    if (prop.type === res.type) {
                        if (prop.enum) {
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

    private handleUnion(types: Schema[], schema: ModuleSchema) {
        const res: Schema = {type: 'object', $oneOf: []};
        for (const type of types) {
            res.$oneOf!.push(this.link(type, schema));
        }
        return res;
    }

    private mergeProperties(entity: Schema & IObjectFields, res: Schema & IObjectFields, schema: ModuleSchema, paramsMap?: Map<string, Schema>) {
        if (!res.properties) {
            res.properties = {};
        }
        if (entity.properties) {
            if (entity.type) {
                res.type = entity.type;
            }
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

    private linkInterface(entity: InterfaceSchema, schema: ModuleSchema): InterfaceSchema {
        if (!schema.definitions) {
            return entity;
        }
        const res = this.handleObject(entity, schema) as InterfaceSchema;
        res.$ref = interfaceId;
        if (entity.extends) {
            const ref = entity.extends.$ref!;
            const extendedEntity = ref.slice(ref.indexOf('#') + 1);
            const refEntity = this.getRefEntity(ref, schema);
            if (!refEntity) {
                return entity;
            }
            let refInterface: InterfaceSchema;
            let pMap: Map<string, Schema> | undefined;
            if (refEntity.genericParams) {
                pMap = new Map();
                refEntity.genericParams.forEach((param, index) => {
                    pMap!.set(`#${extendedEntity}!${param.name}`, entity.genericArguments![index]);
                });
                refInterface = this.linkInterface(refEntity as InterfaceSchema, schema);
                if (refInterface.properties) {
                    const properties = refInterface.properties;
                    for (const prop in properties) {
                        if (properties.hasOwnProperty(prop)) {
                            const tempInheritedFrom = properties[prop].inheritedFrom ? properties[prop].inheritedFrom : '#' + extendedEntity;
                            properties[prop] = pMap.has(properties[prop].$ref!) ? pMap.get(properties[prop].$ref!)! : properties[prop];
                            properties[prop].inheritedFrom = tempInheritedFrom;
                        }
                    }
                }
            } else {
                refInterface = this.linkInterface(refEntity as InterfaceSchema, schema);
                if (refInterface.properties) {
                    for (const p in refInterface.properties) {
                        if (refInterface.properties.hasOwnProperty(p) && !refInterface.properties[p].inheritedFrom) {
                            refInterface.properties[p].inheritedFrom = '#' + extendedEntity;
                        }
                    }
                }
            }
            this.mergeProperties(refInterface, res, schema, pMap);
        }
        return res;
    }

    private linkClass(schema: ModuleSchema, entity: ClassSchema): ClassSchema {
        if (!schema.definitions || !entity.extends) {
            return entity;
        }
        const extendedEntity = entity.extends.$ref!.replace('#', '');
        const refEntity = this.getRefEntity(entity.extends.$ref!, schema) as ClassSchema;
        if (!refEntity) {
            return entity;
        }
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
        res.properties = this.extractClassData(entity, refEntity, extendedEntity, 'properties', schema);
        res.staticProperties = this.extractClassData(entity, refEntity, extendedEntity, 'staticProperties', schema);
        if (entity.genericParams) {
            res.genericParams = entity.genericParams;
        }
        return res;
    }

    private extractClassData(entity: ClassSchema, refEntity: ClassSchema, extendedEntity: string, prop: 'properties' | 'staticProperties', schema: ModuleSchema): {[name: string]: Schema} {
        const res: {[name: string]: Schema & {inheritedFrom?: string}} = {};
        const paramsMap = new Map();
        if (refEntity.genericParams && entity.extends!.genericArguments) {
            refEntity.genericParams.forEach((param, index) => {
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
                    const property = this.link(refProperties[p], schema);
                    if (isRef(property)) {
                        const refType = property.$ref.startsWith(`#${extendedEntity}`) ? property.$ref : `#${extendedEntity}!${property.$ref.replace('#', '')}`;
                        res[p] = Object.assign({inheritedFrom: `#${extendedEntity}`}, paramsMap.get(refType));
                    } else {
                        res[p] = Object.assign({inheritedFrom: `#${extendedEntity}`}, property);
                    }
                } else {
                    res[p].inheritedFrom = `#${extendedEntity}`;
                }
            }
        }
        return res;
    }

    private linkRefObject(refEntity: Schema & IObjectFields, paramsMap: Map<string, Schema>, schema: ModuleSchema): Schema {
        const res: typeof refEntity = {};
        if (refEntity.type) {
            res.type = refEntity.type;
        }
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
                } else if (isSchemaOfType('object', property)) {
                    properties[propName] = this.linkRefObject(property, paramsMap, schema);
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
        this.mergeProperties(entity, res, schema);
        return res;
    }
}
