import ts from 'typescript';

export interface IInferenceResult {
    isLiteral: boolean;
    value: any;
}

function literal(value: any) {
    return {
        isLiteral: true,
        value
    };
}

export function generateDataLiteral(checker: ts.TypeChecker, node: ts.Node): IInferenceResult {
    if (ts.isStringLiteral(node)) {
        return literal(node.text);
    } else if (ts.isNumericLiteral(node)) {
        return literal(parseFloat(node.text));
    } else if (node.getText() === 'true' || node.getText() === 'false') {
        return node.getText() === 'true';
    } else if (ts.isObjectLiteralExpression(node)) {
        const res: any = {};
        for (const prop of node.properties) {
            if (ts.isPropertyAssignment(prop)) {
                const innerRes = generateDataLiteral(checker, prop.initializer);
                if (isFailedInference(innerRes)) {
                    return failed(node.getText());
                }
                res[prop.name!.getText()] = innerRes;
            }
        }
        return res;
    } else if (ts.isObjectBindingPattern(node)) {
        const res: any = {};
        for (const bindingElement of node.elements) {
            if (!bindingElement.initializer) {
                return failed(node.getText());
            }
            const innerRes = generateDataLiteral(checker, bindingElement.initializer);
            if (isFailedInference(innerRes)) {
                return failed(node.getText());
            }
            res[bindingElement.name!.getText()] = innerRes;
        }
        return res;
    } else if (ts.isArrayLiteralExpression(node)) {
        const res: any[] = [];
        for (const element of node.elements) {
            const innerRes = generateDataLiteral(checker, element);
            if (isFailedInference(innerRes)) {
                return failed(node.getText());
            }
            res.push(innerRes);
        }

        return res;
    }

    return failed(node.getText());
}
