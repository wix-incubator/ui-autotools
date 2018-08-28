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

export function createLinkerProgram(files: string[]): typescript.Program {
  return typescript.createProgram(files, {});
}

export function getSchema(filePath: string, exportName: string, program = createLinkerProgram([filePath])) {
  const checker = program.getTypeChecker();
  const linker = new SchemaLinker(program, checker, filePath);
  return linker.flatten(filePath, exportName);
}

export function* extractLinkedSchema(basePath: string, filesGlob: string) {
  const files = glob.sync(filesGlob, {cwd: basePath});
  const program = typescript.createProgram(files, {});
  const checker = program.getTypeChecker();
  for (const file of files) {
    const linkedSchema: any = {};
    const linker = new SchemaLinker(program, checker, path.join(basePath, file));
    const source = program.getSourceFile(file);
    const schema = transform(checker, source!, file, '');
    if (schema.definitions) {
      linkedSchema.properties = schema.properties;
      linkedSchema.definitions = schema.definitions;
      for (const definition in schema.definitions ) {
        if (schema.definitions.hasOwnProperty(definition)) {
          linkedSchema.definitions[definition] = linker.flatten(file, definition);
        }
      }
      if (schema.properties) {
        for (const property in schema.properties ) {
          if (schema.properties.hasOwnProperty(property)) {
            linkedSchema.properties[property] = linker.flatten(file, property);
          }
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
