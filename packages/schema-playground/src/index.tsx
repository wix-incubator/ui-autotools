import ts from 'typescript';
import React from 'react';
import ReactDOM from 'react-dom';
import { createMemoryFs } from '@file-services/memory';
import { createBaseHost, createLanguageServiceHost } from '@file-services/typescript';
import { Playground } from './playground';
import { sampleTsFilePath, sampleTsFile, sampleStFilePath, sampleStFile, compilerOptions } from './constants';

async function main() {
    const fs = createMemoryFs();

    // load .d.ts bundles of TypeScript and React
    const [{ typescriptRecipe }, { reactRecipe }] = await Promise.all([
        import('./recipes/typescript' /* webpackChunkName: 'typescript-recipe' */),
        import('./recipes/react' /* webpackChunkName: 'react-recipe' */)
    ]);

    // populate bundles into fs
    fs.populateDirectorySync('/', typescriptRecipe);
    fs.populateDirectorySync('/', reactRecipe);

    // add initial sample files
    fs.writeFileSync(sampleTsFilePath, sampleTsFile);
    fs.writeFileSync(sampleStFilePath, sampleStFile);

    // initialize hosts
    const baseHost = createBaseHost(fs, '/');
    const languageServiceHost = createLanguageServiceHost(
        fs, baseHost, [sampleTsFilePath], compilerOptions, '/node_modules/typescript/lib'
    );

    // initialize language service
    const languageService = ts.createLanguageService(languageServiceHost);

    // initialize UI
    const container = document.createElement('div');
    container.className = 'react-root';
    document.body.appendChild(container);
    ReactDOM.render((
        <Playground
            baseHost={baseHost}
            fs={fs}
            languageService={languageService}
            filePaths={{
                typescript: sampleTsFilePath,
                stylable: sampleStFilePath
            }}
        />
    ), container);
}

// tslint:disable-next-line:no-console
main().catch(console.error);
