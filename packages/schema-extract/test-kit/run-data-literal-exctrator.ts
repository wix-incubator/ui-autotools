import { generateDataLiteral } from '../src/data-literal-transformer';
import {createTsProgram } from '../src/typescript/createMemoryTsProgram';
import * as ts from 'typescript';
export async function runDataLiteralExtract(sourceFile: string, entityName: string, fileName: string) {
    const {program} = await createTsProgram({[fileName]: sourceFile}, [fileName], false);
    const file = program.getSourceFile(fileName);
    const checker = program.getTypeChecker();
    const fileSymbol = checker.getSymbolAtLocation(file!);
    const exportSymb = checker.getExportsOfModule(fileSymbol!).find((exp) => exp.name === entityName);
    const node = exportSymb!.valueDeclaration;
    if (!ts.isVariableDeclaration(node)) {
        throw new Error('invalid input for run-data-literal');
    }

    return generateDataLiteral(checker, node.initializer!);
}
