import { generateDataLiteral } from '../src/data-literal-transformer';
import {createTsService } from '../src/typescript/createMemoryTsService';
import * as ts from 'typescript';
export async function runDataLiteralExtract(sourceFile: string, entityName: string, fileName: string) {
    const {tsService, fs} = await createTsService({[fileName]: sourceFile}, [fileName], false);
    const program = tsService.getProgram()!;
    const file = program.getSourceFile(fileName);
    const checker = program.getTypeChecker();
    const fileSymbol = checker.getSymbolAtLocation(file!);
    const exportSymb = checker.getExportsOfModule(fileSymbol!).find((exp) => exp.name === entityName);
    const node = exportSymb!.valueDeclaration;
    if (!ts.isVariableDeclaration(node)) {
        throw new Error('invalid input for run-data-literal');
    }

    return {output: generateDataLiteral(checker, node.initializer!, fs.path, fileName), node: node.initializer!};
}
