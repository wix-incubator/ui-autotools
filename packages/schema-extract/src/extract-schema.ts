import path from 'path';
import glob from 'glob';
import typescript from 'typescript';
import {LocalFileSystem} from 'kissfs';
import {transform, getSchemaFromImport} from './file-transformer';
import {createHost} from './isomorphc-typescript-host';
import {SchemaLinker, IExtractor} from './file-linker';
import { ModuleSchema } from './json-schema-types';

export function* extractSchema(basePath: string, filesGlob: string) {
  const files = glob.sync(filesGlob, {cwd: basePath});
  const host = createHost(new LocalFileSystem(basePath));
  const program = typescript.createProgram(files, {}, host);
  const checker = program.getTypeChecker();
  for (const file of files) {
    const source = program.getSourceFile(file);
    const schema = transform(checker, source!, file, '');
    yield {
      file: path.join(basePath, file),
      schema
    };
  }
}

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
  const x: IExtractor = {
    getSchema,
    getSchemaFromImport: getImport
  };
  return new SchemaLinker(x);
}
