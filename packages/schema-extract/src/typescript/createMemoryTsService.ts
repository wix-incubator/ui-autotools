import { createMemoryFs } from '@file-services/memory';
import { createBaseHost, createLanguageServiceHost } from '@file-services/typescript';
import { compilerOptions } from './constants';
import { IDirectoryContents } from '@file-services/types';
import * as ts from 'typescript';
import { getRecipies } from './get-recipes';
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
        (await getRecipies()).map((recipe) => fs.populateDirectorySync('/', recipe));
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
