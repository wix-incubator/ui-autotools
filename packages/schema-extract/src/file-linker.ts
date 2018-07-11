import * as ts from 'typescript';
import { transform } from '../src/file-transformer';
import { Schema } from './json-schema-types';

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
        const x = schema.definitions![name];
        if (x.$ref) {
            // need to slice according to #?
            const xType = x.$ref.replace('#', '');
            const y = schema.definitions![xType];
            res.type = y.type;
            if (y.genericParams && x.genericArguments) {
                const paramsMap = (y.genericParams as Schema[]).map((param) => `#${xType}!${param.name}`);
                const properties: {[name: string]: Schema} = {};
                for (const p in (y as any).properties) {
                    if ((y as any).properties.hasOwnProperty(p)) {
                        const argIndex = paramsMap.indexOf((y as any).properties[p].$ref);
                        const type = x.genericArguments[argIndex];
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
