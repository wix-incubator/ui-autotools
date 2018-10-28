import ts from 'typescript';
import * as path from 'path';
import { transform, getSchemaFromImport } from './file-transformer';
import { Schema, IObjectFields, ClassSchemaId, ClassSchema, ModuleSchema, isRef, isSchemaOfType, isClassSchema, UnknownId, isInterfaceSchema, InterfaceSchema, interfaceId, isFunctionSchema, FunctionSchema, isObjectSchema } from './json-schema-types';

export class SchemaLinker {
    private checker: ts.TypeChecker;
    private sourceFile: ts.SourceFile | undefined;
    private schema: ModuleSchema | undefined;

    constructor(private program: ts.Program, private projectPath: string, private pathUtils: typeof path.posix) {
        this.checker = program.getTypeChecker();
    }

    public flatten(file: string, entityName: string): Schema {
        this.sourceFile = this.program.getSourceFile(file);
        if (!this.sourceFile) {
            return {$ref: UnknownId};
        }
        this.schema = transform(this.checker, this.sourceFile, file, this.projectPath, this.pathUtils);
        let entity;
        if (this.schema.definitions) {
            entity = this.schema.definitions[entityName];
        }
        if (!entity && this.schema.properties) {
            entity = this.schema.properties[entityName];
        }
        if (!entity) {
            return {$ref: UnknownId};
        }
        return this.link(entity);
    }

    private link(entity: Schema, paramsMap?: Map<string, Schema>): Schema {
        if (!entity) {
            return {$ref: UnknownId};
        }
        if (isClassSchema(entity)) {
            return this.linkClass(entity);
        }
        if (isInterfaceSchema(entity)) {
            return this.linkInterface(entity);
        }
        if (isFunctionSchema(entity)) {
            return this.linkFunction(entity, paramsMap);
        }
        if (isRef(entity) && (paramsMap || entity.genericArguments)) {
            return this.handleRef(entity, paramsMap);
        }
        if (entity.$allOf) {
            return this.handleIntersection(entity.$allOf, paramsMap);
        }
        if (entity.$oneOf) {
            return this.handleUnion(entity.$oneOf);
        }
        if (isSchemaOfType('object', entity)) {
            return this.handleObject(entity, paramsMap);
        }
        return entity;
    }

    private getRefEntity(ref: string, paramsMap?: Map<string, Schema>): {refEntity: Schema | null, refEntityType: string} {
        if (!ref) {
            return {refEntity: null, refEntityType: ref};
        }
        const poundIndex = ref.indexOf('#');
        let cleanRef = ref.slice(poundIndex + 1).replace('typeof ', '');
        if (!this.schema || !this.schema.definitions) {
            return {refEntity: null, refEntityType: cleanRef};
        }
        if (paramsMap && paramsMap.has(ref)) {
            const e = paramsMap.get(ref)!;
            return isRef(e) ? this.getRefEntity(e.$ref, paramsMap) : {refEntity: e, refEntityType: cleanRef};
        }
        let refEntity = this.schema.definitions[cleanRef] ? this.schema.definitions[cleanRef] : null;
        if (!refEntity) {
            const importSchema = getSchemaFromImport(ref.slice(0, poundIndex), ref.slice(poundIndex + 1), this.checker, this.program, this.pathUtils, this.sourceFile);
            if (importSchema && importSchema.definitions) {
                refEntity = importSchema.definitions[cleanRef];
                while (isRef(refEntity)) {
                    cleanRef = refEntity.$ref.slice(refEntity.$ref.indexOf('#') + 1);
                    refEntity = importSchema.definitions[cleanRef];
                }
            }
        }

        if (!refEntity) {
            return {refEntity: null, refEntityType: cleanRef};
        }

        if (isRef(refEntity)) {
            return this.getRefEntity(refEntity.$ref, paramsMap);
        }
        refEntity.definedAt = refEntity.definedAt || '#' + cleanRef;

        return {refEntity, refEntityType: cleanRef};
    }

    private handleRef(entity: Schema & {$ref: string}, paramsMap?: Map<string, Schema>) {
        const {refEntity, refEntityType} = this.getRefEntity(entity.$ref, paramsMap);
        if (!refEntity) {
            return entity;
        }
        if (refEntity.genericParams && entity.genericArguments)  {
            const pMap = new Map();
            refEntity.genericParams!.forEach((param, index) => {
                pMap.set(`#${refEntityType}!${param.name}`, this.link(entity.genericArguments![index]));
            });
            if (isSchemaOfType('object', refEntity) || isInterfaceSchema(refEntity)) {
                return this.linkRefObject(refEntity, pMap);
            }
            return this.link(refEntity, pMap);
        }
        return refEntity;
    }

    private handleIntersection(options: Schema[], paramsMap?: Map<string, Schema>): Schema {
        if (options.length === 0) {
            throw new Error('Cannot intersect an empty array');
        }
        let res: Schema = {};
        for (const o of options) {
            const option = isRef(o) ? this.handleRef(o, paramsMap) : o;
            if (isClassSchema(option) || isFunctionSchema(option)) {
                throw new Error('Invalid intersection');
            }
            if (Object.keys(res).length === 0) {
                res = option;
                continue;
            }
            if (res.type && option.type && res.type !== option.type) {
                throw new Error('Cannot intersect two different type');
            }
            if ((isObjectSchema(option) || isInterfaceSchema(option)) && (isInterfaceSchema(res) || isObjectSchema(res))) {
                res = this.mergeObjects(res, option, paramsMap);
            }
        }
        return res;
    }

    private mergeObjects(object1: Schema & IObjectFields, object2: Schema & IObjectFields, paramsMap?: Map<string, Schema>): Schema & IObjectFields {
        if (!object1.properties || !object2.properties) {
            return object1;
        }
        const res: Schema & IObjectFields & {properties: {[name: string]: Schema}} = {type: 'object', properties: {}};
        for (const [key, val] of Object.entries(object1.properties)) {
            res.properties[key] = val;
            if (object1.definedAt) {
                res.properties[key].definedAt = object1.definedAt;
            }
        }
        for (const [key, val] of Object.entries(object2.properties)) {
            if (!res.properties.hasOwnProperty(key)) {
                res.properties[key] = val;
                if (object2.definedAt) {
                    res.properties[key].definedAt = res.properties[key].definedAt ? res.properties[key].definedAt : object2.definedAt;
                }
            } else {
                res.properties[key] = this.handleIntersection([res.properties[key], val], paramsMap);
            }
        }
        res.required = Array.from(new Set([...object1.required || [], ...object2.required || []]));
        return res;
    }

    private handleUnion(types: Schema[]) {
        const res: Schema = {$oneOf: []};
        for (const type of types) {
            res.$oneOf!.push(this.link(type));
        }
        return res;
    }

    private linkInterface(entity: InterfaceSchema): InterfaceSchema {
        if (!this.schema || !this.schema.definitions) {
            return entity;
        }
        const res: InterfaceSchema = {$ref: interfaceId, properties: {...entity.properties}};
        if (entity.required) {
            res.required = [...entity.required];
        }
        if (entity.extends) {
            const {refEntity, refEntityType} = this.getRefEntity(entity.extends.$ref!);
            if (!refEntity) {
                return entity;
            }
            const refInterface = this.linkInterface(refEntity as InterfaceSchema);
            const pMap: Map<string, Schema> = new Map();
            if (refEntity.genericParams) {
                refEntity.genericParams.forEach((param, index) => {
                    pMap!.set(`#${refEntityType}!${param.name}`, entity.genericArguments![index]);
                });
            }
            const properties = refInterface.properties;
            for (const prop in properties) {
                if (properties.hasOwnProperty(prop) && !res.properties.hasOwnProperty(prop)) {
                    res.properties[prop] = pMap.has(properties[prop].$ref!) ? pMap.get(properties[prop].$ref!)! : properties[prop];
                    res.properties[prop].inheritedFrom = properties[prop].inheritedFrom ? properties[prop].inheritedFrom : '#' + refEntityType;
                }
            }
            if (!res.required) {
                res.required = refInterface.required;
            } else {
                res.required = Array.from(new Set([...res.required, ...refInterface.required || []]));
            }
        }
        return res;
    }

    private linkClass(entity: ClassSchema): ClassSchema {
        if (!this.schema || !this.schema.definitions || !entity.extends) {
            return entity;
        }
        const {refEntity, refEntityType} = this.getRefEntity(entity.extends.$ref!);
        if (!refEntity) {
            return entity;
        }
        const res = {
            $ref: ClassSchemaId,
            extends: {$ref: entity.extends.$ref},
            properties: {},
            staticProperties: {}
        } as ClassSchema;
        const paramsMap = new Map();
        const isGeneric = !!(refEntity.genericParams && entity.extends!.genericArguments);
        if (isGeneric) {
            refEntity.genericParams!.forEach((param, index) => {
                paramsMap.set(`#${refEntityType}!${param.name}`, entity.extends!.genericArguments![index]);
            });
        }
        if (entity.hasOwnProperty('constructor')) {
            res.constructor = Object.assign({}, entity.constructor);
        } else if (refEntity.hasOwnProperty('constructor')) {
            res.constructor = Object.assign({}, (refEntity as ClassSchema).constructor);
        }
        res.properties = this.extractClassData(entity, (refEntity as ClassSchema), refEntityType, 'properties', paramsMap, isGeneric);
        res.staticProperties = this.extractClassData(entity, (refEntity as ClassSchema), refEntityType, 'staticProperties', paramsMap, isGeneric);
        if (entity.genericParams) {
            res.genericParams = [...entity.genericParams];
        }
        return res;
    }

    private extractClassData(entity: ClassSchema, refEntity: ClassSchema, extendedEntity: string, prop: 'properties' | 'staticProperties', paramsMap: Map<string, Schema>, isGeneric: boolean): {[name: string]: Schema} {
        const refProperties = refEntity[prop];
        const properties = entity[prop];
        const res: {[name: string]: Schema & {inheritedFrom?: string}} = {...properties};
        for (const p in refProperties) {
            if (!properties.hasOwnProperty(p)) {
                const property = refProperties[p];
                if (isRef(property)) {
                    const refType = property.$ref.startsWith(`#${extendedEntity}`) ? property.$ref : `#${extendedEntity}!${property.$ref.replace('#', '')}`;
                    res[p] = Object.assign({inheritedFrom: `#${extendedEntity}`}, paramsMap.get(refType));
                } else {
                    res[p] = Object.assign({inheritedFrom: `#${extendedEntity}`}, isGeneric ? this.link(property, paramsMap) : property);
                }
            }
        }
        return res;
    }

    private linkRefObject(refEntity: Schema & IObjectFields, paramsMap: Map<string, Schema>): Schema {
        const res: typeof refEntity = {};
        if (refEntity.type) {
            res.type = refEntity.type;
        }
        const refProperties = refEntity.properties;
        if (!refProperties) {
            return res;
        }
        const properties: typeof refProperties = {};
        for (const [key, val] of Object.entries(refProperties)) {
            if (isRef(val)) {
                if (paramsMap.has(val.$ref)) {
                    const p = paramsMap.get(val.$ref)!;
                    properties[key] = isRef(p) ? this.handleRef(p, paramsMap) : p;
                }
            } else if (val.$allOf) {
                properties[key] = this.handleIntersection(val.$allOf, paramsMap);
            } else if (isObjectSchema(val) || isInterfaceSchema(val)) {
                properties[key] = this.linkRefObject(val, paramsMap);
            }
        }
        if (refEntity.definedAt) {
            res.definedAt = refEntity.definedAt;
        }
        res.properties = properties;
        if (refEntity.required) {
            res.required = refEntity.required;
        }
        return res;
    }

    private handleObject(entity: Schema & IObjectFields, paramsMap?: Map<string, Schema>): Schema {
        const res: typeof entity = {};
        if (!entity.properties) {
            return entity;
        }
        res.properties = {};
        for (const p in entity.properties) {
            if (entity.properties.hasOwnProperty(p)) {
                res.properties[p] = paramsMap ? this.link(entity.properties[p], paramsMap) : entity.properties[p];
            }
        }
        if (entity.required) {
            res.required = [...entity.required];
        }
        return res;
    }

    private linkFunction(entity: FunctionSchema, paramsMap?: Map<string, Schema>): Schema {
        const res = {...entity};
        const args = [];
        for (const arg of entity.arguments) {
            if (isRef(arg) && paramsMap && paramsMap.has(arg.$ref)) {
                const newArg: Schema = {...paramsMap.get(arg.$ref)};
                if (res.genericParams) {
                    delete res.genericParams;
                }
                newArg.name = arg.name;
                args.push(newArg);
            } else {
                args.push(arg);
            }
        }
        if (res.returns && isRef(res.returns) && paramsMap && paramsMap.has(res.returns.$ref)) {
            res.returns = paramsMap.get(res.returns.$ref);
        }
        res.arguments = args;
        return res;
    }
}
