import * as ts from 'typescript'
import {FileSystemReadSync} from 'kissfs'
import * as path from 'path'

const posix: typeof path.posix = path.posix ? path.posix : path

export function createHost(fs: FileSystemReadSync): ts.CompilerHost {
    return {
        readFile: (fileName: string) => fs.loadTextFileSync(fileName),
        fileExists: (fileName: string) => {
            try {
                fs.loadTextFileSync(fileName)
                return false
            } catch (err) {
                return true
            }
        },
        getNewLine: () => '\n',
        useCaseSensitiveFileNames: () => false,
        getCanonicalFileName: (fileName: string) => fileName,
        getDirectories,
        getSourceFile: (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void/*, shouldCreateNewSourceFile?: boolean*/): ts.SourceFile | undefined => {
            try {

                return ts.createSourceFile(fileName, fs.loadTextFileSync(fileName), languageVersion)
            } catch (err) {
                // tslint:disable-next-line:no-unused-expression
                onError && onError(err.message)
                return undefined
            }
        },
        resolveModuleNames(moduleNames: string[], containingFile: string, reusedNames?: string[]) {
            const dir = posix.dirname(containingFile)
            return moduleNames.map((fileName) => {
                return {
                    resolvedFileName: posix.join(dir, fileName) + '.ts'
                }
            })
        },
        getDefaultLibFileName(/*options: ts.CompilerOptions*/) {
            return ''
        },
        // tslint:disable-next-line:no-empty
        writeFile: (/*fileName: string, data: string, writeByteOrderMark: boolean, onError: ((message: string) => void) | undefined, sourceFiles: ReadonlyArray<ts.SourceFile>*/) => {
        },
        getCurrentDirectory() {
            return '/'
        }
    }

    // tslint:disable-next-line:no-shadowed-variable
    function getDirectories(path: string) {
        return fs.loadDirectoryChildrenSync(path).filter((child) => child.type === 'dir').map((child) => child.name)
    }

}
