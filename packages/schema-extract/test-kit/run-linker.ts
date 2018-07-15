import * as ts from 'typescript';
import { MemoryFileSystem, DirectoryContent } from 'kissfs';
import { createHost } from '../src/isomorphc-typescript-host';
import {  Schema } from '../src/json-schema-types';
import { SchemaLinker } from '../src/file-linker';

export function linkTest(sourceDir: DirectoryContent, entityName: string, modulePath: string): Schema {
    const memFs = new MemoryFileSystem();
    const projectName = 'someProject';
    const testedPath = '/' + projectName + '/src/';
    const testedFile = testedPath + modulePath;
    MemoryFileSystem.addContent(memFs, {
        [projectName]: {
            src: sourceDir,
        },
    });

    const prg = ts.createProgram([testedFile], {}, createHost(memFs));
    const chckr = prg.getTypeChecker();
    const linker = new SchemaLinker(prg, chckr);

    // return await linker.flatten(testedFile, entityName);
    return linker.flatten(testedFile, entityName, modulePath);
}
