import ts from 'typescript';

export const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2017,
    lib: [
        'lib.es2017.d.ts',
        'lib.dom.d.ts',
    ],
    jsx: ts.JsxEmit.React,
    esModuleInterop: true
};
