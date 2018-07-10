import * as ts from 'typescript';
import { transform } from '../src/file-transformer';
import { MemoryFileSystem } from 'kissfs';
import { createHost } from '../src/isomorphc-typescript-host';
import { ModuleSchema } from '../src/json-schema-types';

export function linkTest(source: string, moduleId: string, entityName: string): ModuleSchema<any> {
    const memFs = new MemoryFileSystem();
    const projectName = 'someProject';
    const testedPath = '/' + projectName + '/src/tested-module';
    const testedFile = testedPath + '.ts';
    const fixture = `
    export type AType  = string;
    export class AClass{

    }
    export class AGenericClass<T,Q>{

    }`;
    MemoryFileSystem.addContent(memFs, {
        [projectName]: {
            src: {
                'tested-module.ts': source,
                'test-assets.ts': fixture,
            },
        },

    });
    const prg = ts.createProgram([testedFile, projectName + '/src/test-assets.ts'], {}, createHost(memFs));
    const chckr = prg.getTypeChecker();
    return transform(chckr, prg.getSourceFile(testedFile)!, '/src/' + moduleId, '/' + projectName);
}
