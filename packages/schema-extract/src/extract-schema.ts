import path from 'path';
import glob from 'glob';
import typescript from 'typescript';
import {LocalFileSystem} from 'kissfs';
import {transform} from './file-transformer';
import {createHost} from './isomorphc-typescript-host';
import {SchemaLinker} from './file-linker';

let program: typescript.Program;

export function* extractSchema(basePath: string, filesGlob: string) {
  const files = glob.sync(filesGlob, {cwd: basePath});
  const host = createHost(new LocalFileSystem(basePath));
  const prg = typescript.createProgram(files, {}, host);
  const checker = prg.getTypeChecker();
  for (const file of files) {
    const source = prg.getSourceFile(file);
    const schema = transform(checker, source!, file, '');
    yield {
      file: path.join(basePath, file),
      schema
    };
  }
}

export function createLinkerProgram(files: string[]) {
  program = typescript.createProgram(files, {});
}

export function getSchema(filePath: string, exportName: string) {
  if (!program) {
    program = typescript.createProgram([filePath], {});
  }
  const checker = program.getTypeChecker();
  const linker = new SchemaLinker(program, checker, filePath);
  return linker.flatten(filePath, exportName);
}

export function* extractLinkedSchema(basePath: string, filesGlob: string) {
  const files = glob.sync(filesGlob, {cwd: basePath});
  const prg = typescript.createProgram(files, {});
  const checker = prg.getTypeChecker();
  for (const file of files) {
    const linkedSchema: any = {};
    const linker = new SchemaLinker(prg, checker, path.join(basePath, file));
    const source = prg.getSourceFile(file);
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
