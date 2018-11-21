import {attachHook} from '@stylable/node';
attachHook();

import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {JSDOM} from 'jsdom';
import ts from 'typescript';
import {createMemoryFs} from '@file-services/memory';
import {createBaseHost, createLanguageServiceHost} from '@file-services/typescript';
import {transform} from '@ui-autotools/schema-extract';
import {compilerOptions} from '../src/constants';
import {typescriptRecipe} from '../src/recipes/typescript';
import {reactRecipe} from '../src/recipes/react';
import {BaseView, defaultSchemaViewRegistry} from '@ui-autotools/schema-views/src';

export function getTypescriptSchema(source: string, exportName?: string) {
  const sourcePath = '/index.tsx';

  const fs = createMemoryFs();
  fs.populateDirectorySync('/', typescriptRecipe);
  fs.populateDirectorySync('/', reactRecipe);
  fs.writeFileSync(sourcePath, source);

  const baseHost = createBaseHost(fs, '/');
  const languageServiceHost = createLanguageServiceHost(
    fs,
    baseHost,
    [sourcePath],
    compilerOptions,
    '/node_modules/typescript/lib'
  );
  const languageService = ts.createLanguageService(languageServiceHost);

  const program = languageService.getProgram();
  if (!program) {
    throw new Error('Failed to create a program');
  }
  const typeChecker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(sourcePath);
  if (!sourceFile) {
    throw new Error('Failed to retrieve the source file');
  }
  const moduleSchema = transform(typeChecker, sourceFile, sourcePath, '/', fs.path);

  if (exportName) {
    return moduleSchema.properties![exportName] ||
           moduleSchema.definitions![exportName];
  }
  return moduleSchema;
}

export function renderSchema(schema: any): Element {
  const html = renderToStaticMarkup(
    <BaseView
      schema={schema}
      schemaRegistry={new Map()}
      viewRegistry={defaultSchemaViewRegistry}
    />
  );
  return new JSDOM(html).window.document.body.firstElementChild!;
}
