import * as ts from 'typescript';
// import { MemoryFileSystem, DirectoryContent } from 'kissfs';
import { MemoryFileSystem } from 'kissfs';
import { createHost } from '../src/isomorphc-typescript-host';
// import {  Schema } from '../src/json-schema-types';
import { SchemaLinker } from '../src/file-linker';

// export async function linkTest(sourceDir: DirectoryContent, modulePath: string, entityName: string): Promise<Schema> {
export function linkTest(source: string, entityName: string, modulePath: string): any {
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

    // MemoryFileSystem.addContent(memFs, sourceDir);
    const prg = ts.createProgram([testedFile, projectName + '/src/test-assets.ts'], {}, createHost(memFs));
    const chckr = prg.getTypeChecker();

    const linker = new SchemaLinker(prg, chckr);

    // return await linker.flatten(testedFile, entityName);
    return linker.flatten(testedFile, entityName, modulePath);
}
