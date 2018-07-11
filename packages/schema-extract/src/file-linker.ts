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
        const res: Schema = {};
        const schema = transform(this.checker, this.program.getSourceFile(file)!, '/src/' + moduleId, '/someProject');
        if (!schema.definitions) {
            return res;
        }
        const entity = schema.definitions[name];
        if (isRef(entity)) {
            // need to slice according to #?
            const entityType = entity.$ref.replace('#', '');
            const refEntity = schema.definitions[entityType];
            res.type = refEntity.type;
            // break down to smaller ifs?
            if (isObjectSchema(refEntity) && refEntity.genericParams && entity.genericArguments) {
                const refProperties = refEntity.properties;
                if (!refProperties) {
                    return res;
                }
                const paramsMap = (refEntity.genericParams as Schema[]).map((param) => `#${entityType}!${param.name}`);
                const properties: {[name: string]: Schema} = {};
                for (const p in refProperties) {
                    if (refProperties.hasOwnProperty(p)) {
                        const argIndex = paramsMap.indexOf(refProperties[p].$ref!);
                        const type = entity.genericArguments[argIndex];
                        properties[p] = type as Schema;
                    }
                }
                (res as any).properties = properties;
            }
            return res;
        } else {
        return res;
        }
    }
}

function isRef(schema: Schema): schema is Schema & {$ref: string} {
    return !!schema.$ref;
}

function isObjectSchema(schema: Schema): schema is IObjectFields {
    return schema.type === 'object';
}
