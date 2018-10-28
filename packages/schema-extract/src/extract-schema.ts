import typescript from 'typescript';
import {transform, getSchemaFromImport} from './file-transformer';
import {SchemaLinker, IExtractor} from './file-linker';
import { ModuleSchema } from './json-schema-types';

export function createLinker(files: string[]) {
  const program = typescript.createProgram(files, {});
  function getSchema(file: string): ModuleSchema {
    const sourceFile = program.getSourceFile(file);
    if (!sourceFile) {
      return {
        $schema: 'http://json-schema.org/draft-06/schema#',
        $id: '',
        $ref: 'common/module',
        properties: {},
    };
    }
    return transform(program.getTypeChecker(), sourceFile, file, '');
  }
  function getImport(importPath: string, ref: string, file: string): ModuleSchema | null {
    return getSchemaFromImport(importPath, ref, program, program.getSourceFile(file));
  }
  const extractor: IExtractor = {
    getSchema,
    getSchemaFromImport: getImport
  };
  return new SchemaLinker(extractor);
}
