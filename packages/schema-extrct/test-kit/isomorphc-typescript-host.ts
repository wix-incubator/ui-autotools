
import * as ts from 'typescript';
import {FileSystemReadSync} from 'kissfs';

export function createHost(fs:FileSystemReadSync):ts.CompilerHost{

    // getSourceFile(fileName: string, languageVersion: ScriptTarget, onError?: (message: string) => void, shouldCreateNewSourceFile?: boolean): SourceFile | undefined;
    // getDefaultLibFileName(options: CompilerOptions): string;
    // const writeFile: ts.WriteFileCallback;
    
    return {
        readFile:(fileName: string)=>fs.loadTextFileSync(fileName),
        fileExists:(fileName: string)=>{
            try{
                fs.loadTextFileSync(fileName)
                return false
            }catch(err){
                return true
            }
        },
        getNewLine:()=>'\n',
        useCaseSensitiveFileNames:()=>false,
        getCanonicalFileName:(fileName: string)=>fileName,
        getDirectories,
        getSourceFile:(fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void/*, shouldCreateNewSourceFile?: boolean*/): ts.SourceFile | undefined=>{
            try{

                return ts.createSourceFile(fileName,fs.loadTextFileSync(fileName),languageVersion)
            }catch(err){
                onError && onError(err.message)
                return undefined
            }
        },
        getDefaultLibFileName(/*options: ts.CompilerOptions*/){
            return ''
        },
        writeFile:(/*fileName: string, data: string, writeByteOrderMark: boolean, onError: ((message: string) => void) | undefined, sourceFiles: ReadonlyArray<ts.SourceFile>*/)=>{
        },
        getCurrentDirectory(){
            return '/'
        }
    }

    function getDirectories(path: string) {
        return fs.loadDirectoryChildrenSync(path).filter((child) => child.type === 'dir').map(child => child.name);
    }

}