import path from 'path';
import glob from 'glob';
import typescript from 'typescript';
import {LocalFileSystem} from 'kissfs';
import {transform} from './file-transformer';
import {createHost} from './isomorphc-typescript-host';
import {SchemaLinker} from './file-linker';

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

export function* extractLinkedSchema(basePath: string, filesGlob: string) {
  const files = glob.sync(filesGlob, {cwd: basePath});
  const host = createHost(new LocalFileSystem(basePath));
  const program = typescript.createProgram(files, {}, host);
  const checker = program.getTypeChecker();
  let linkedSchema;
  for (const file of files) {
    const source = program.getSourceFile(file);
    const schema = transform(checker, source!, file, '');
    if (schema.definitions) {
      for (const definition in schema.definitions ) {
        if (schema.definitions.hasOwnProperty(definition)) {
          const linker = new SchemaLinker(program, checker, path.join(basePath, file));
          linkedSchema = linker.flatten(file, definition);
        }
      }
    }
    yield {
      file: path.join(basePath, file),
      schema,
      linkedSchema
    };
  }
}
