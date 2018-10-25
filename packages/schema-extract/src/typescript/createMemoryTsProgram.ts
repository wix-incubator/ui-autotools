import { createMemoryFs } from '@file-services/memory';
import { createBaseHost, IBaseHost } from '@file-services/typescript';
import { compilerOptions } from './constants';
import { IDirectoryContents, IFileSystem } from '@file-services/types';
import * as ts from 'typescript';
import { getRecipies } from './get-recipes';
export async function createTsProgram(contents: IDirectoryContents, rootFiles: string[], includeRecipes: boolean = false) {

    const fs = createMemoryFs(contents);
    if (includeRecipes) {
        (await getRecipies()).map((recipe) => fs.populateDirectorySync('/', recipe));
    }

    const baseHost = createBaseHost(fs, '/');

    const host = createHost(fs,  baseHost);
    const program = ts.createProgram({
        host,
        options: compilerOptions,
        rootNames: rootFiles
    });
    return {
        baseHost,
        fs,
        program
    };

}

export function createHost(fs: IFileSystem, baseHost: IBaseHost): ts.CompilerHost {
    return {
        readFile: (fileName: string) => fs.readFileSync(fileName),
        fileExists: (fileName: string) => fs.fileExistsSync(fileName),
        getNewLine: () => '\n',
        useCaseSensitiveFileNames: () => fs.caseSensitive,
        getCanonicalFileName: (fileName: string) => fileName,
        getDirectories: (path: string) => {
            return fs.readdirSync(path).filter((itemPath: string) => {
                const stat = fs.statSync(itemPath);
                return stat.isDirectory();
            });
        },
        getSourceFile: (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void/*, shouldCreateNewSourceFile?: boolean*/): ts.SourceFile | undefined => {
            try {

                return ts.createSourceFile(fileName, fs.readFileSync(fileName), languageVersion);
            } catch (err) {
                // tslint:disable-next-line:no-unused-expression
                onError && onError(err.message);
                return undefined;
            }
        },
        resolveModuleNames(moduleNames: string[], containingFile: string, reusedNames?: string[]) {
            return moduleNames.map((fileName) => {
                return ts.resolveModuleName(fileName, containingFile, compilerOptions, baseHost).resolvedModule;
            });
        },
        getDefaultLibFileName(options: ts.CompilerOptions) {
            return fs.path.join('/node_modules/typescript/lib', ts.getDefaultLibFileName(options));
        },
        // tslint:disable-next-line:no-empty
        writeFile: (/*fileName: string, data: string, writeByteOrderMark: boolean, onError: ((message: string) => void) | undefined, sourceFiles: ReadonlyArray<ts.SourceFile>*/) => {
        },
        getCurrentDirectory() {
            return '/';
        },
    };

}
