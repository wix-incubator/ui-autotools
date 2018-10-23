import ts from 'typescript';
import React from 'react';
import ReactDOM from 'react-dom';
import { createMemoryFs } from '@file-services/memory';
import { createBaseHost, createLanguageServiceHost } from '@file-services/typescript';
import { Playground } from './playground';

const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2017,
    lib: [
        'lib.es2017.d.ts',
        'lib.dom.d.ts',
    ],
    jsx: ts.JsxEmit.React,
    esModuleInterop: true
};

const sampleFilePath = '/index.tsx';
const sampleFile = `
import React from 'react'

export interface IProps {
}

export class Comp extends React.Component<IProps> {
    render() {
        return <div />
    }
}
`.trimLeft();

async function main() {
    const fs = createMemoryFs();

    // load .d.ts bundles of TypeScript and React
    const [{ typescriptRecipe }, { reactRecipe }] = await Promise.all([
        import('./recipes/typescript' /* webpackChunkName: 'typescript-recipe' */),
        import('./recipes/react' /* webpackChunkName: 'react-recipe' */)
    ]);

    fs.populateDirectorySync('/', typescriptRecipe);
    fs.populateDirectorySync('/', reactRecipe);

    fs.writeFileSync(sampleFilePath, sampleFile);

    const baseHost = createBaseHost(fs, '/');

    const languageServiceHost = createLanguageServiceHost(
        fs, baseHost, [sampleFilePath], compilerOptions, '/node_modules/typescript/lib'
    );

    const languageService = ts.createLanguageService(languageServiceHost);

    const container = document.createElement('div');
    document.body.appendChild(container);
    ReactDOM.render((
        <Playground
            baseHost={baseHost}
            fs={fs}
            languageService={languageService}
            filePath={sampleFilePath}
        />
    ), container);
}

// tslint:disable-next-line:no-console
main().catch(console.error);
