import ts from 'typescript';

export const sampleTypescriptFilePath = '/index.tsx';
export const sampleTypescriptFile = `
import {Component} from 'react';

export interface IProps { }

export class Comp extends Component<IProps> {
  render() {
    return <div />;
  }
}
`.trimLeft();

export const sampleStylableFilePath = '/index.st.css';
export const sampleStylableFile = `
.root {
  -st-states: checked, disabled, size(enum(small, medium, large));
}

.root:disabled {
  pointer-events: none;
}

.nativeCheckbox {
  opacity: 0;
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
