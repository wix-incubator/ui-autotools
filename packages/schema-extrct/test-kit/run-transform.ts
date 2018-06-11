import * as ts from 'typescript';
import { transform } from '../src/file-transformer';
import { MemoryFileSystem } from 'kissfs';
import { createHost } from '../test-kit/isomorphc-typescript-host';
import { ModuleSchema } from '../src/json-schema-types';




export function transformTest(source:string, moduleId:string):ModuleSchema<any>{
    const memFs = new MemoryFileSystem();
    const testedPath = '/src/tested-module';
    const testedFile = testedPath+'.ts';
    const fixture = `
    export type AType  = string;
    export class AClass{
    
    }
    export class AGenericClass<T,Q>{
        
    }`
    MemoryFileSystem.addContent(memFs,{
        src:{
            "tested-module.ts":source,
            "test-assets.ts":fixture
        }
    })
    const prg = ts.createProgram([testedFile],{},createHost(memFs));
    const chckr = prg.getTypeChecker();

    return transform(chckr,prg.getSourceFile(testedFile)!, moduleId);
}
