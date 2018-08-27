import * as ts from 'typescript';
import {union} from 'lodash';
import { transform } from './file-transformer';
import { Schema, IObjectFields, ClassSchemaId, ClassSchema, ModuleSchema, isRef, isSchemaOfType, isClassSchema, NeverId, UnknownId, isInterfaceSchema, InterfaceSchema, interfaceId, isNeverSchema, FunctionSchemaId, isFunctionSchema, FunctionSchema, NullSchemaId } from './json-schema-types';

export class SchemaLinker {
    private checker: ts.TypeChecker;
    private program: ts.Program;
    private projectPath: string;
    private sourceFile: ts.SourceFile | undefined;
    private importSchema: ModuleSchema | null | undefined;

    constructor(program: ts.Program, checker: ts.TypeChecker, projectPath: string) {
        this.checker = checker;
        this.program = program;
        this.projectPath = projectPath;
    }

    public flatten(file: string, entityName: string): Schema {
        this.importSchema = null;
        const sourceFile = this.program.getSourceFile(file);
        if (!sourceFile) {
            return {$ref: UnknownId};
        }
        this.sourceFile = sourceFile;
        const schema = transform(this.checker, sourceFile, file, this.projectPath);
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

    private getRefEntity(ref: string, schema: ModuleSchema, paramsMap?: Map<string, Schema>): {refEntity: Schema | null, refEntityType: string} {
        if (!ref) {
            return {refEntity: null, refEntityType: ref};
        }
        const poundIndex = ref.indexOf('#');
        const cleanRef = ref.slice(poundIndex + 1);
        if (!schema.definitions) {
            return {refEntity: null, refEntityType: cleanRef};
        }
        let refEntity = (paramsMap && paramsMap.has(ref)) ?
                        paramsMap.get(ref) :
                        schema.definitions[cleanRef] ?
                        schema.definitions[cleanRef] :
                        this.importSchema && this.importSchema.definitions ?
                        this.importSchema.definitions[cleanRef] :
                        null;
        if (!refEntity) {
            const importSchema = this.getSchemaFromImport(ref.slice(0, poundIndex), ref.slice(poundIndex + 1));
            if (importSchema) {
                this.importSchema = importSchema;
            }
            if (this.importSchema && this.importSchema.definitions) {
                refEntity = this.importSchema.definitions[cleanRef];
            }
        }
        if (!refEntity) {
            return {refEntity: null, refEntityType: cleanRef};
        }
        if (ref.slice(0, poundIndex) === 'react') {
            return {refEntity: this.handleReact(refEntity, cleanRef), refEntityType: cleanRef};
        }
        if (isRef(refEntity)) {
            return this.getRefEntity(refEntity.$ref, schema, paramsMap);
        }
        refEntity.definedAt = '#' + cleanRef;
        return {refEntity, refEntityType: cleanRef};
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
        if (isRef(entity)) {
            return this.handleRef(entity, schema, paramsMap);
        }
        if (entity.$allOf) {
            return this.handleIntersection(entity.$allOf, schema, paramsMap);
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
        let res: Schema & IObjectFields = {};
        for (const option of options) {
            let entity;
            if (isRef(option)) {
                entity = this.link(this.handleRef(option, schema, paramsMap), schema, paramsMap);
                this.mergeProperties(entity, res, schema, paramsMap);
            } else if (isSchemaOfType('object', option)) {
                entity = this.link(option, schema, paramsMap);
                this.mergeProperties(entity, res, schema, paramsMap);
            } else if (option.$oneOf) {
                const linkedOption = this.link(option, schema, paramsMap);
                const newRes: Schema = {$oneOf: []};
                if (Object.keys(res).length === 0) {
                    const rest = options.slice(1);
                    for (const t of linkedOption.$oneOf!) {
                        const r = this.handleIntersection([t, ...rest], schema, paramsMap);
                        if (r.$oneOf) {
                            newRes.$oneOf = union(newRes.$oneOf, r.$oneOf);
                        } else {
                            newRes.$oneOf!.push(r);
                        }
                    }
                    return newRes;
                } else {
                    for (const t of linkedOption.$oneOf!) {
                        const r = this.handleIntersection([res, t], schema, paramsMap);
                        if (isNeverSchema(r)) {
                            continue;
                        } else {
                            newRes.$oneOf!.push(r);
                        }
                    }
                    if (res.$oneOf) {
                        res.$oneOf = union(res.$oneOf, newRes.$oneOf);
                    } else {
                        res = newRes;
                    }
                }
            } else {
                if (!res.type && option.type) {
                    res.type = option.type;
                    if (option.enum) {
                        res.enum = option.enum;
                    }
                } else {
                    if (Object.keys(res).length === 0) {
                        res = option;
                    } else if (option.type && option.type === res.type) {
                        if (option.enum) {
                            if (!res.enum) {
                                res.enum = option.enum;
                            } else {
                                const enums = [];
                                for (let i = 0; i < option.enum.length; i++) {
                                    if (option.enum.includes(res.enum![i])) {
                                        enums.push(option.enum[i]);
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
        const res: Schema = {$oneOf: []};
        for (const type of types) {
            res.$oneOf!.push(this.link(type, schema));
        }
        return res;
    }

    private mergeProperties(entity: Schema & (IObjectFields | InterfaceSchema), res: Schema & (IObjectFields | InterfaceSchema), schema: ModuleSchema, paramsMap?: Map<string, Schema>) {
        if (isInterfaceSchema(entity)) {
            res.$ref = interfaceId;
            if (res.type) {
                delete res.type;
            }
        }
        if (entity.type && !isInterfaceSchema(res)) {
            res.type = entity.type;
        }
        if (entity.properties) {
            const properties = entity.properties;
            if (!res.properties) {
                res.properties = {};
            }
            for (const prop in properties) {
                if (!res.properties.hasOwnProperty(prop)) {
                    res.properties[prop] = this.link(properties[prop], schema, paramsMap);
                } else {
                    const r = this.handleIntersection([res.properties![prop], properties[prop]], schema, paramsMap);
                    if (isNeverSchema(r)) {
                        // Maybe there is a better way than this
                        res.$ref = NeverId;
                        delete res.properties;
                        delete res.required;
                        delete res.type;
                        return;
                    } else {
                        res.properties[prop] = r;
                    }
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
            const {refEntity, refEntityType} = this.getRefEntity(entity.extends.$ref!, schema);
            if (!refEntity) {
                return entity;
            }
            let refInterface: InterfaceSchema;
            let pMap: Map<string, Schema> | undefined;
            if (refEntity.genericParams) {
                pMap = new Map();
                refEntity.genericParams.forEach((param, index) => {
                    pMap!.set(`#${refEntityType}!${param.name}`, entity.genericArguments![index]);
                });
                refInterface = this.linkInterface(refEntity as InterfaceSchema, schema);
                if (refInterface.properties) {
                    const properties = refInterface.properties;
                    for (const prop in properties) {
                        if (properties.hasOwnProperty(prop)) {
                            const tempInheritedFrom = properties[prop].inheritedFrom ? properties[prop].inheritedFrom : '#' + refEntityType;
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
                            refInterface.properties[p].inheritedFrom = '#' + refEntityType;
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
        if (entity.hasOwnProperty('constructor')) {
            res.constructor = Object.assign({}, entity.constructor);
        } else if (refEntity.hasOwnProperty('constructor')) {
            res.constructor = Object.assign({}, (refEntity as ClassSchema).constructor);
        }
        res.properties = this.extractClassData(entity, (refEntity as ClassSchema), refEntityType, 'properties', schema);
        res.staticProperties = this.extractClassData(entity, (refEntity as ClassSchema), refEntityType, 'staticProperties', schema);
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
                res[p] = this.link(properties[p], schema, paramsMap);
            }
        }
        for (const p in refProperties) {
            if (refProperties.hasOwnProperty(p)) {
                if (!properties.hasOwnProperty(p)) {
                    const property = this.link(refProperties[p], schema, paramsMap);
                    if (isRef(property)) {
                        const refType = property.$ref.startsWith(`#${extendedEntity}`) ? property.$ref : `#${extendedEntity}!${property.$ref.replace('#', '')}`;
                        res[p] = Object.assign({inheritedFrom: `#${extendedEntity}`}, paramsMap.get(refType));
                    } else {
                        res[p] = Object.assign({inheritedFrom: `#${extendedEntity}`}, property);
                    }
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

    private linkFunction(entity: FunctionSchema, schema: ModuleSchema, paramsMap?: Map<string, Schema>): Schema {
        const res = Object.assign({}, entity);
        const args = [];
        for (const arg of entity.arguments) {
            let newArg;
            if (arg.$ref && paramsMap) {
                // Maybe needs link here?
                newArg = Object.assign({}, paramsMap.get(arg.$ref));
                if (res.genericParams) {
                    delete res.genericParams;
                }
            }
            if (!newArg) {
                newArg = this.link(arg, schema, paramsMap);
            }
            newArg.name = arg.name;
            args.push(newArg);
        }
        if (res.returns && isRef(res.returns)) {
            const ret = this.handleRef(res.returns, schema, paramsMap);
            res.returns = ret ? {type: ret.type} : res.returns;
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
