import ts from 'typescript';

export const sampleTsFilePath = '/index.tsx';
export const sampleTsFile = `
import {Component} from 'react';

export interface IProps { }

export class Comp extends Component<IProps> {
  render() {
    return <div />;
  }
}
`.trimLeft();

export const sampleStFilePath = '/index.st.css';
export const sampleStFile = `
.root {
  -st-states: checked, disabled;
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
