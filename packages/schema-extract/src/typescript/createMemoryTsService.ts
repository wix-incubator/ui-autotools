import ts from 'typescript';
import { createMemoryFs } from '@file-services/memory';
import { createBaseHost, createLanguageServiceHost } from '@file-services/typescript';
import { compilerOptions } from './constants';
import { IDirectoryContents } from '@file-services/types';

export async function createTsService(contents: IDirectoryContents, rootFiles: string[], includeRecipes: boolean = false) {
    const fs = createMemoryFs(contents);

    const openFiles = new Set(rootFiles);
    const openFile = (path: string) => {
        if (openFiles.has(path)) {
            throw (new Error('file is already open: ' + path));
        }
        openFiles.add(path);
    };
    const closeFile = (path: string) => {
        if (!openFiles.has(path)) {
            throw (new Error('file is not open' + path));
        }
        openFiles.delete(path);
    };
    const getOpenFiles = () => new Set(openFiles);

    if (includeRecipes) {
        const recipes = await Promise.all([
            import(/* webpackChunkName: 'react-recipe' */ './recipes/react'),
            import(/* webpackChunkName: 'typescript-recipe' */'./recipes/typescript')
        ]);

        recipes.map((recipe) => fs.populateDirectorySync('/', recipe));
    }

    const baseHost = createBaseHost(fs, '/');

    const tsHost = createLanguageServiceHost(
        fs, baseHost, rootFiles, compilerOptions, '/node_modules/typescript/lib'
    );

    const tsService = ts.createLanguageService(tsHost);

    return {
        baseHost,
        fs,
        tsHost,
        openFile,
        closeFile,
        getOpenFiles,
        tsService
    };
}
