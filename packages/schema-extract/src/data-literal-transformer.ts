import ts from 'typescript';
import {  resolveImportedIdentifier, IFileSystemPath} from './imported-identifier-resolver';

export interface ILiteralInferenceResult {
    isLiteral: true;
    value: any;
}

export interface IExpressionInferenceResult {
    isLiteral: false;
    value: any;
    expression: string;
}

function aLiteralValue(value: any): ILiteralInferenceResult {
    return {
        isLiteral: true,
        value
    };
}

function anExpression(value: any, expression: string,  extraFields: any = {}): IExpressionInferenceResult {
    return {
        isLiteral: false,
        value,
        expression
    };
}

function aProcessedExpression(type: string, id: string, expression: string,  extraFields: any = {}): IExpressionInferenceResult {
    return {
        isLiteral: false,
        value: {
            __serilizedType: type,
            id,
            ...extraFields
        },
        expression
    };
}

export function generateDataLiteral(checker: ts.TypeChecker, node: ts.Node, usedPath: IFileSystemPath, modulePath: string = '', ): ILiteralInferenceResult | IExpressionInferenceResult {
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
        return isLiteral ?  aLiteralValue(value) : anExpression(value, node.getText());
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
        return isLiteral ?  aLiteralValue(value) : anExpression(value, node.getText());
    } else if (ts.isArrayLiteralExpression(node)) {
        const value: any[] = [];
        let isLiteral = true;
        for (const element of node.elements) {
            const innerRes = generateDataLiteral(checker, element, usedPath, modulePath);
            isLiteral = isLiteral && innerRes.isLiteral;
            value.push(innerRes.value);
        }

        return isLiteral ?  aLiteralValue(value) : anExpression(value, node.getText());
    } else if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) {
        let currentNode: ts.Node = node;
        const expression: string[] = [];
        do {
            if (ts.isPropertyAccessExpression(currentNode)) {
                expression.push(currentNode.name.getText());
                currentNode = currentNode.expression;
            }
            if (ts.isElementAccessExpression(currentNode)) {
                const innerValue = generateDataLiteral(checker, currentNode.argumentExpression, usedPath, modulePath);
                expression.push(innerValue.value);
                currentNode = currentNode.expression;
            }
        } while (ts.isPropertyAccessExpression(currentNode) || ts.isElementAccessExpression(currentNode));

        const id = getIdFromExpression(checker, currentNode as ts.Expression, modulePath, usedPath);
        return aProcessedExpression('reference', id, node.getText(), {innerPath: expression.reverse()});
    } else if (ts.isIdentifier(node)) {
        return aProcessedExpression('reference', getIdFromExpression(checker, node, modulePath, usedPath), node.getText());
    } else if (ts.isCallExpression(node)) {
        return aProcessedExpression('reference-call', getIdFromExpression(checker, node.expression, modulePath, usedPath), node.getText(), {
            args: node.arguments.map((arg) => generateDataLiteral(checker, arg, usedPath, modulePath).value)
        });
    } else if (ts.isNewExpression(node)) {
        return aProcessedExpression('reference-construct', getIdFromExpression(checker, node.expression, modulePath, usedPath), node.getText(),  {
            args: node.arguments!.map((arg) => generateDataLiteral(checker, arg, usedPath, modulePath).value)
        });
    }
    return anExpression(undefined, node.getText());
}

function getIdFromExpression(checker: ts.TypeChecker, node: ts.Expression, modulePath: string, pathUtil: IFileSystemPath) {

    const referencedSymb = checker.getSymbolAtLocation(node)!;
    const referencedSymbDecl = referencedSymb.valueDeclaration || referencedSymb.declarations[0];
    if (referencedSymbDecl) {
        const importedRef = resolveImportedIdentifier(referencedSymbDecl, modulePath, pathUtil);
        if (importedRef) {
            return importedRef;
        }
    }
    return '#' + node.getText();
}
