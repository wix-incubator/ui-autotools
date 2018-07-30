import path from 'path';
import glob from 'glob';
import typescript from 'typescript';
import {LocalFileSystem} from 'kissfs';
import {transform} from './file-transformer';
import {createHost} from './isomorphc-typescript-host';
import {SchemaLinker} from './file-linker';

export function* extractSchema(basePath: string, filesGlob: string, linked = false) {
  const files = glob.sync(filesGlob, {cwd: basePath});
  const host = createHost(new LocalFileSystem(basePath));
  const program = typescript.createProgram(files, {}, host);
  const checker = program.getTypeChecker();
  for (const file of files) {
    let linkedSchema;
    const source = program.getSourceFile(file);
    const schema = transform(checker, source!, file, '');
    if (linked && schema.definitions) {
      const linkedSchemas = [];
      for (const definition in schema.definitions ) {
        if (schema.definitions.hasOwnProperty(definition)) {
          const linker = new SchemaLinker(program, checker, path.join(basePath, file));
          linkedSchemas.push(JSON.stringify(linker.flatten(file, definition), null, 4));
        }
      }
      linkedSchema = linkedSchemas.join('\n\n');
    }
    yield {
      file: path.join(basePath, file),
      schema,
      linkedSchema
    };
  }
}
