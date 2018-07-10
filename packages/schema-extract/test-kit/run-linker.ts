import * as ts from 'typescript';
import { transform } from '../src/file-transformer';
import { MemoryFileSystem, DirectoryContent } from 'kissfs';
import { createHost } from '../src/isomorphc-typescript-host';
import {  Schema } from '../src/json-schema-types';




export async function linkTest(sourceDir: DirectoryContent, modulePath: string, entityName:string): Promise<Schema> {
    const memFs = new MemoryFileSystem();
    const projectName = 'someProject';
    const testedPath = '/' + projectName + modulePath;
    const testedFile = testedPath + '.ts';

    MemoryFileSystem.addContent(memFs, sourceDir);
    const prg = ts.createProgram([testedFile, projectName + '/src/test-assets.ts'], {}, createHost(memFs));
    const chckr = prg.getTypeChecker();

    const linker = new SchemaLinker(prg, chckr)


    return await linker.flatten(testedFile,entityName);
}
