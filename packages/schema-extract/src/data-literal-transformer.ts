import ts from 'typescript';
import * as path from 'path';
import {  resolveImportedIdentifier} from './imported-identifier-resolver';
export interface IInferenceResult {
    isLiteral: boolean;
    value: any;
}

function aLiteralValue(value: any) {
    return {
        isLiteral: true,
        value
    };
}

function anExpression(type: string, id: string, extraFields: any = {}) {
    return {
        isLiteral: false,
        value: {
            __serilizedType: type,
            id,
            ...extraFields
        }
    };
}

export function generateDataLiteral(checker: ts.TypeChecker, node: ts.Node, usedPath: typeof path.posix, modulePath: string = '', ): IInferenceResult {
    if (ts.isStringLiteral(node)) {
        return aLiteralValue(node.text);
    } else if (ts.isNumericLiteral(node)) {
        return aLiteralValue(parseFloat(node.text));
    } else if (node.getText() === 'true' || node.getText() === 'false') {
        return aLiteralValue(node.getText() === 'true');
    } else if (ts.isObjectLiteralExpression(node)) {
        const value: any = {};
        let isLiteral = true;
        for (const prop of node.properties) {
            if (ts.isPropertyAssignment(prop)) {
                const innerRes = generateDataLiteral(checker, prop.initializer, usedPath, modulePath);
                isLiteral = isLiteral && innerRes.isLiteral;
                value[prop.name!.getText()] = innerRes.value;
            }
        }
        return { isLiteral, value};
    } else if (ts.isObjectBindingPattern(node)) {
        const value: any = {};
        let isLiteral = true;
        for (const bindingElement of node.elements) {
            if (!bindingElement.initializer) {
                isLiteral = false;
                value[bindingElement.name!.getText()] = {};
            } else {
                const innerRes = generateDataLiteral(checker, bindingElement.initializer, usedPath, modulePath);
                isLiteral = isLiteral && innerRes.isLiteral;
                value[bindingElement.name!.getText()] = innerRes.value;
            }
        }
        return value;
    } else if (ts.isArrayLiteralExpression(node)) {
        const value: any[] = [];
        let isLiteral = true;
        for (const element of node.elements) {
            const innerRes = generateDataLiteral(checker, element, usedPath, modulePath);
            isLiteral = isLiteral && innerRes.isLiteral;
            value.push(innerRes.value);
        }

        return { isLiteral, value};
    } else if (ts.isIdentifier(node)) {
        const aPath =  resolveImportedIdentifier(node, modulePath, usedPath)!;
        return anExpression('reference', aPath);
        // return { isLiteral, value};
    }

    return { isLiteral: false, value: undefined};
}
