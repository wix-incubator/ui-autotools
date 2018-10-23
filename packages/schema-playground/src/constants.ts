import ts from 'typescript';
export const sampleFilePath = '/index.tsx';
export const sampleFile = `
import React from 'react'

export interface IProps {
}

export class Comp extends React.Component<IProps> {
    render() {
        return <div />
    }
}
`.trimLeft();

export const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2017,
    lib: [
        'lib.es2017.d.ts',
        'lib.dom.d.ts',
    ],
    jsx: ts.JsxEmit.React,
    esModuleInterop: true
};
