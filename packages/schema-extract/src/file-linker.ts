import ts from 'typescript';
import {union} from 'lodash';
import { transform, getSchemaFromImport } from './file-transformer';
import { Schema, IObjectFields, ClassSchemaId, ClassSchema, ModuleSchema, isRef, isSchemaOfType, isClassSchema, UnknownId, isInterfaceSchema, InterfaceSchema, interfaceId, isFunctionSchema, FunctionSchema, isObjectSchema, NullSchemaId, FunctionSchemaId } from './json-schema-types';

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
        this.sourceFile = this.program.getSourceFile(file);
        if (!this.sourceFile) {
            return {$ref: UnknownId};
        }
        const schema = transform(this.checker, this.sourceFile, file, this.projectPath);
        let entity;
        if (schema.definitions) {
            entity = schema.definitions[entityName];
        }
        if (!entity && schema.properties) {
            entity = schema.properties[entityName];
        }
        if (!entity) {
            return {$ref: UnknownId};
        }
        return this.link(entity, schema);
    }

    private link(entity: Schema, schema: ModuleSchema, paramsMap?: Map<string, Schema>): Schema {
        if (!entity) {
            return {$ref: UnknownId};
        }
        if (isClassSchema(entity)) {
            return this.linkClass(schema, entity);
        }
        if (isInterfaceSchema(entity)) {
            return this.linkInterface(entity, schema);
        }
        if (isFunctionSchema(entity)) {
            return this.linkFunction(entity, schema, paramsMap);
        }
        if (isRef(entity) && (paramsMap || entity.genericArguments)) {
            return this.handleRef(entity, schema, paramsMap);
        }
        if (entity.$allOf) {
            return this.handleIntersection(entity.$allOf, schema, paramsMap);
        }
        if (entity.$oneOf) {
            return this.handleUnion(entity.$oneOf, schema);
        }
        if (isSchemaOfType('object', entity)) {
            return this.handleObject(entity, schema, paramsMap);
        }
        return entity;
    }

    private getRefEntity(ref: string, schema: ModuleSchema, paramsMap?: Map<string, Schema>): {refEntity: Schema | null, refEntityType: string} {
        if (!ref) {
            return {refEntity: null, refEntityType: ref};
        }
        const poundIndex = ref.indexOf('#');
        const cleanRef = ref.slice(poundIndex + 1).replace('typeof ', '');
        if (!schema.definitions) {
            return {refEntity: null, refEntityType: cleanRef};
        }
        if (paramsMap && paramsMap.has(ref)) {
            return {refEntity: paramsMap.get(ref)!, refEntityType: cleanRef};
        }
        let refEntity = schema.definitions[cleanRef] ? schema.definitions[cleanRef] : null;
        if (!refEntity) {
            const importSchema = getSchemaFromImport(ref.slice(0, poundIndex), ref.slice(poundIndex + 1), this.checker, this.program, this.sourceFile);
            if (importSchema && importSchema.definitions) {
                refEntity = importSchema.definitions[cleanRef];
            }
        }

        if (!refEntity) {
            return {refEntity: null, refEntityType: cleanRef};
        }

        // This code is not relevant at the moment
        if (ref.slice(0, poundIndex) === 'react') {
            return {refEntity: this.handleReact(refEntity, cleanRef), refEntityType: cleanRef};
        }

        if (isRef(refEntity)) {
            return this.getRefEntity(refEntity.$ref, schema, paramsMap);
        }
        refEntity.definedAt = refEntity.definedAt || '#' + cleanRef;

        return {refEntity, refEntityType: cleanRef};
    }

    private handleRef(entity: Schema & {$ref: string}, schema: ModuleSchema, paramsMap?: Map<string, Schema>) {
        const {refEntity, refEntityType} = this.getRefEntity(entity.$ref, schema, paramsMap);
        if (!refEntity) {
            return entity;
        }
        if (refEntity.genericParams && entity.genericArguments)  {
            const pMap = new Map();
            refEntity.genericParams!.forEach((param, index) => {
                pMap.set(`#${refEntityType}!${param.name}`, this.link(entity.genericArguments![index], schema));
            });
            if (isSchemaOfType('object', refEntity)) {
                return this.linkRefObject(refEntity, pMap, schema);
            }
            return this.link(refEntity, schema, pMap);
        }
        return refEntity;
    }

    private handleIntersection(options: Schema[], schema: ModuleSchema, paramsMap?: Map<string, Schema>): Schema {
        if (options.length === 0) {
            throw new Error('Cannot intersect an empty array');
        }
        let res: Schema = {};
        for (const o of options) {
            const option = isRef(o) ? this.handleRef(o, schema, paramsMap) : o;
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
            if (isObjectSchema(option) && (isInterfaceSchema(res) || isObjectSchema(res))) {
                res = this.mergeObjects(res, option, schema, paramsMap);
            }
        }
        return res;
    }

    private mergeObjects(object1: Schema & IObjectFields, object2: Schema & IObjectFields, schema: ModuleSchema, paramsMap?: Map<string, Schema>): Schema & IObjectFields {
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
                res.properties[key] = this.handleIntersection([res.properties[key], val], schema, paramsMap);
            }
        }
        res.required = union(object1.required, object2.required);
        return res;
    }

    private handleUnion(types: Schema[], schema: ModuleSchema) {
        const res: Schema = {$oneOf: []};
        for (const type of types) {
            res.$oneOf!.push(this.link(type, schema));
        }
        return res;
    }

    private linkInterface(entity: InterfaceSchema, schema: ModuleSchema): InterfaceSchema {
        if (!schema.definitions) {
            return entity;
        }
        const res: InterfaceSchema = {$ref: interfaceId, properties: {...entity.properties}};
        if (entity.required) {
            res.required = [...entity.required];
        }
        if (entity.extends) {
            const {refEntity, refEntityType} = this.getRefEntity(entity.extends.$ref!, schema);
            if (!refEntity) {
                return entity;
            }
            const refInterface = this.linkInterface(refEntity as InterfaceSchema, schema);
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
                res.required = union(res.required, refInterface.required);
            }
        }
        return res;
    }

    private linkClass(schema: ModuleSchema, entity: ClassSchema): ClassSchema {
        if (!schema.definitions || !entity.extends) {
            return entity;
        }
        const {refEntity, refEntityType} = this.getRefEntity(entity.extends.$ref!, schema);
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
        let isGeneric = false;
        if (refEntity.genericParams && entity.extends!.genericArguments) {
            refEntity.genericParams.forEach((param, index) => {
                paramsMap.set(`#${refEntityType}!${param.name}`, entity.extends!.genericArguments![index]);
            });
            isGeneric = true;
        }
        if (entity.hasOwnProperty('constructor')) {
            res.constructor = Object.assign({}, entity.constructor);
        } else if (refEntity.hasOwnProperty('constructor')) {
            res.constructor = Object.assign({}, (refEntity as ClassSchema).constructor);
        }
        res.properties = this.extractClassData(entity, (refEntity as ClassSchema), refEntityType, 'properties', schema, paramsMap, isGeneric);
        res.staticProperties = this.extractClassData(entity, (refEntity as ClassSchema), refEntityType, 'staticProperties', schema, paramsMap, isGeneric);
        if (entity.genericParams) {
            res.genericParams = [...entity.genericParams];
        }
        return res;
    }

    private extractClassData(entity: ClassSchema, refEntity: ClassSchema, extendedEntity: string, prop: 'properties' | 'staticProperties', schema: ModuleSchema, paramsMap: Map<string, Schema>, isGeneric: boolean): {[name: string]: Schema} {
        const refProperties = refEntity[prop];
        const properties = entity[prop];
        const res: {[name: string]: Schema & {inheritedFrom?: string}} = {...properties};
        for (const p in refProperties) {
            if (refProperties.hasOwnProperty(p) && !properties.hasOwnProperty(p)) {
                const property = refProperties[p];
                if (isRef(property)) {
                    const refType = property.$ref.startsWith(`#${extendedEntity}`) ? property.$ref : `#${extendedEntity}!${property.$ref.replace('#', '')}`;
                    res[p] = Object.assign({inheritedFrom: `#${extendedEntity}`}, paramsMap.get(refType));
                } else {
                    res[p] = Object.assign({inheritedFrom: `#${extendedEntity}`}, isGeneric ? this.link(property, schema, paramsMap) : property);
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
        if (refEntity.definedAt) {
            res.definedAt = refEntity.definedAt;
        }
        res.properties = properties;
        if (refEntity.required) {
            res.required = refEntity.required;
        }
        return res;
    }

    private handleObject(entity: Schema & IObjectFields, schema: ModuleSchema, paramsMap?: Map<string, Schema>): Schema {
        const res: typeof entity = {};
        if (!entity.properties) {
            return entity;
        }
        res.properties = {};
        for (const p in entity.properties) {
            if (entity.properties.hasOwnProperty(p)) {
                res.properties[p] = paramsMap ? this.link(entity.properties[p], schema, paramsMap) : entity.properties[p];
            }
        }
        if (entity.required) {
            res.required = [...entity.required];
        }
        return res;
    }

    private linkFunction(entity: FunctionSchema, schema: ModuleSchema, paramsMap?: Map<string, Schema>): Schema {
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

    private handleReact(entity: Schema, ref: string): Schema {
        const newEntity: any = Object.assign({}, entity);
        if (ref === 'Component') {
            newEntity.properties = {props: newEntity.properties.props, state: newEntity.properties.state};
            const props = newEntity.properties.props;
            if (props.$allOf) {
                if (props.$allOf.length === 2) {
                    newEntity.properties.props = props.$allOf[1];
                } else {
                    newEntity.properties.props.$allOf = props.$allOf.slice(1);
                }
            }
            return newEntity;
        }
        if (ref === 'SFC') {
            const res = {
                $ref: FunctionSchemaId,
                arguments: [{
                    name: 'props',
                    $ref: entity.genericArguments![0].$ref
                }],
                requiredArguments: ['props'],
                returns: {
                    $oneOf: [
                        {
                            $ref: 'react#ReactElement'
                        },
                        {
                            $ref: NullSchemaId
                        }
                    ]
                },
                genericParams: entity.genericParams
            };
            return res;
        }
        return {$ref: 'react#' + ref};
    }
}
