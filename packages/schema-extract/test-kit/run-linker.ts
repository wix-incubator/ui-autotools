import ts from 'typescript';
import { MemoryFileSystem, DirectoryContent } from 'kissfs';
import { createHost } from '../src/isomorphc-typescript-host';
import {  Schema, ModuleSchema } from '../src/json-schema-types';
import { SchemaLinker, IExtractor } from '../src/file-linker';
import {transform, getSchemaFromImport} from '../src/file-transformer';

export function linkTest(sourceDir: DirectoryContent, entityName: string, fileName: string): Schema {
    const memFs = new MemoryFileSystem();
    const projectName = 'someProject';
    const projectPath = `/${projectName}`;
    const testedPath = projectPath + '/src/';
    const testedFile = testedPath + fileName;
    MemoryFileSystem.addContent(memFs, {
        [projectName]: {
            src: sourceDir,
        },
    });
    const prg = ts.createProgram([testedFile], {}, createHost(memFs));
    function getSchema(file: string): ModuleSchema {
        const sourceFile = prg.getSourceFile(file);
        if (!sourceFile) {
          return {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: file,
            $ref: 'common/module',
            properties: {},
        };
        }
        return transform(prg.getTypeChecker(), sourceFile, file, '');
      }
    function getImport(importPath: string, ref: string, file: string) {
        return getSchemaFromImport(importPath, ref, prg, prg.getSourceFile(file));
    }
    const extractor: IExtractor = {
        getSchema,
        getSchemaFromImport: getImport
    };
    const linker = new SchemaLinker(extractor);

    return linker.flatten(testedFile, entityName);
}
