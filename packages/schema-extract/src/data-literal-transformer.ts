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

interface ISerializer<INPUT extends ts.Node, OUTPUT extends ILiteralInferenceResult | IExpressionInferenceResult = ILiteralInferenceResult | IExpressionInferenceResult> {
    isApplicable: (node: ts.Node) => node is INPUT;
    serialize: (checker: ts.TypeChecker, node: INPUT, usedPath: IFileSystemPath, modulePath: string) => OUTPUT;
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

function aProcessedExpression(type: string, expression: string,  extraFields: any = {}): IExpressionInferenceResult {
    return {
        isLiteral: false,
        value: {
            __serilizedType: type,
            ...extraFields
        },
        expression
    };
}

const callExpressionSerializer: ISerializer<ts.CallExpression> = {
    isApplicable: function is(node): node is ts.CallExpression {
        return ts.isCallExpression(node);
    },
    serialize: (checker, node, usedPath, modulePath) =>  {
        return aProcessedExpression('reference-call', node.getText(), {
            id: getIdFromExpression(checker, node.expression, modulePath, usedPath),
            args: node.arguments.map((arg) => generateDataLiteral(checker, arg, usedPath, modulePath).value)
        });
    }
};
const newExpressionSerializer: ISerializer<ts.NewExpression> = {
    isApplicable: function is(node): node is ts.NewExpression {
        return ts.isNewExpression(node);
    },
    serialize: (checker, node, usedPath, modulePath) =>  {
        return aProcessedExpression('reference-construct', node.getText(),  {
            id: getIdFromExpression(checker, node.expression, modulePath, usedPath),
            args: node.arguments!.map((arg) => generateDataLiteral(checker, arg, usedPath, modulePath).value)
        });
    }
};

const identifierSerializer: ISerializer<ts.Identifier> = {
    isApplicable: function is(node): node is ts.Identifier {
        return ts.isIdentifier(node);
    },
    serialize: (checker, node, usedPath, modulePath) =>  {
        return aProcessedExpression('reference', node.getText(), {
            id: getIdFromExpression(checker, node, modulePath, usedPath)
        });
    }
};

const stringLiteralSerializer: ISerializer<ts.StringLiteral> = {
    isApplicable: function is(node): node is ts.StringLiteral {
        return ts.isStringLiteral(node);
    },
    serialize: (checker, node, usedPath, modulePath) =>  {
        return aLiteralValue(node.text);
    }
};

const booleanLiteralSerializer: ISerializer<ts.BooleanLiteral> = {
    isApplicable: function is(node): node is ts.BooleanLiteral {
        return node.getText() === 'true' || node.getText() === 'false';
    },
    serialize: (checker, node, usedPath, modulePath) =>  {
        return aLiteralValue(node.getText() === 'true');
    }
};
const numericLiteralSerializer: ISerializer<ts.NumericLiteral> = {
    isApplicable: function is(node): node is ts.NumericLiteral {
        return ts.isNumericLiteral(node);
    },
    serialize: (checker, node, usedPath, modulePath) =>  {
        return  aLiteralValue(parseFloat(node.text));
    }
};

const objectLiteralSerializer: ISerializer<ts.ObjectLiteralExpression> = {
    isApplicable: function is(node): node is ts.ObjectLiteralExpression {
        return ts.isObjectLiteralExpression(node);
    },
    serialize: (checker, node, usedPath, modulePath) =>  {
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
    }
};

const arrayLiteralSerializer: ISerializer<ts.ArrayLiteralExpression> = {
    isApplicable: function is(node): node is ts.ArrayLiteralExpression {
        return ts.isArrayLiteralExpression(node);
    },
    serialize: (checker, node, usedPath, modulePath) =>  {
        const value: any[] = [];
        let isLiteral = true;
        for (const element of node.elements) {
            const innerRes = generateDataLiteral(checker, element, usedPath, modulePath);
            isLiteral = isLiteral && innerRes.isLiteral;
            value.push(innerRes.value);
        }

        return isLiteral ?  aLiteralValue(value) : anExpression(value, node.getText());
    }
};

const objectBindingSerializer: ISerializer<ts.ObjectBindingPattern> = {
    isApplicable: function is(node): node is ts.ObjectBindingPattern {
        return ts.isObjectBindingPattern(node);
    },
    serialize: (checker, node, usedPath, modulePath) =>  {
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
    }
};

const propertyAccessSerializer: ISerializer<ts.PropertyAccessExpression | ts.ElementAccessExpression> = {
    isApplicable: function is(node): node is ts.PropertyAccessExpression | ts.ElementAccessExpression {
        return ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node);
    },
    serialize: (checker, node, usedPath, modulePath) =>  {
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
        return aProcessedExpression('reference', node.getText(), {id, innerPath: expression.reverse()});
    }
};
const trinaryExpressionSerializer: ISerializer<ts.ConditionalExpression> = {
    isApplicable: function is(node): node is ts.ConditionalExpression {
        return ts.isConditionalExpression(node) || ts.isElementAccessExpression(node);
    },
    serialize: (checker, node, usedPath, modulePath) =>  {
       return aProcessedExpression('common/if', node.getText(), {
           condition: generateDataLiteral(checker, node.condition, usedPath, modulePath).value,
           whenTrue: generateDataLiteral(checker, node.whenTrue, usedPath, modulePath).value,
           whenFalse: generateDataLiteral(checker, node.whenFalse, usedPath, modulePath).value
       });
    }
};

const notExpressionSerializer: ISerializer<ts.PrefixUnaryExpression> = {
    isApplicable: function is(node): node is ts.PrefixUnaryExpression {
        return ts.isPrefixUnaryExpression(node) && ts.SyntaxKind.ExclamationToken === node.operator;
    },
    serialize: (checker, node, usedPath, modulePath) =>  {
       return aProcessedExpression('common/not-operator', node.getText(), {
           expression: generateDataLiteral(checker, node.operand, usedPath, modulePath).value
       });
    }
};
const supportedBinaryOperatorsNames: {[key: number]: string} = {
    [ts.SyntaxKind.AmpersandAmpersandToken]: 'common/binary-and-operator',
    [ts.SyntaxKind.BarBarToken]: 'common/binary-or-operator',
    [ts.SyntaxKind.GreaterThanToken]: 'common/greater-then-operator',
    [ts.SyntaxKind.GreaterThanEqualsToken]: 'common/equal-greater-then-operator',
    [ts.SyntaxKind.LessThanToken]: 'common/lesser-then-operator',
    [ts.SyntaxKind.LessThanEqualsToken]: 'common/equal-lesser-then-operator',
    [ts.SyntaxKind.EqualsEqualsToken]: 'common/equal-operator',
    [ts.SyntaxKind.EqualsEqualsEqualsToken]: 'common/equal-operator',
    [ts.SyntaxKind.ExclamationEqualsToken]: 'common/not-equal-operator',
    [ts.SyntaxKind.ExclamationEqualsEqualsToken]: 'common/not-equal-operator',
    [ts.SyntaxKind.PlusToken]: 'common/plus-operator',
    [ts.SyntaxKind.MinusToken]: 'common/minus-operator',
    [ts.SyntaxKind.AsteriskToken]: 'common/multiplication-operator',
    [ts.SyntaxKind.SlashToken]: 'common/division-operator',
};

const supportedBinaryOperators = Object.keys(supportedBinaryOperatorsNames);
const binaryExpressionSerializer: ISerializer<ts.BinaryExpression> = {
    isApplicable: function is(node): node is ts.BinaryExpression {
        return ts.isBinaryExpression(node) && supportedBinaryOperators.includes(node.operatorToken.kind.toString());
    },
    serialize: (checker, node, usedPath, modulePath) =>  {
       const typeStr = supportedBinaryOperatorsNames[node.operatorToken.kind];
       return aProcessedExpression(typeStr, node.getText(), {
          firstOption: generateDataLiteral(checker, node.left, usedPath, modulePath).value,
          secondOption: generateDataLiteral(checker, node.right, usedPath, modulePath).value
       });
    }
};

const parenthesisSerializer: ISerializer<ts.ParenthesizedExpression> = {
    isApplicable: function is(node): node is ts.ParenthesizedExpression {
        return ts.isParenthesizedExpression(node);
    },
    serialize: (checker, node, usedPath, modulePath) =>  {
       return aProcessedExpression('common/parenthesis', node.getText(), {
          expression: generateDataLiteral(checker, node.expression, usedPath, modulePath).value
       });
    }
};
const jsxAttributeSerializer: ISerializer<ts.JsxAttribute> = {
    isApplicable: function is(node): node is ts.JsxAttribute {
        return ts.isJsxAttribute(node);
    },
    serialize: (checker, node, usedPath, modulePath) =>  {
        if (!node.initializer) {
            return {
                __serilizedType: 'jsx-attribute',
                name: node.name.getText(),
                value: true,
                isLiteral: true
            };
        }
        const initializer = node.initializer;
        if (ts.isStringLiteral(initializer)) {
            return {
                __serilizedType: 'jsx-attribute',
                name: node.name.getText(),
                value: initializer.text,
                isLiteral: true
            };
        } else {
            const res = generateDataLiteral(checker, initializer.expression!, usedPath, modulePath);
            return {
                ...res,
                __serilizedType: 'jsx-attribute',
                name: node.name.getText()
            };
        }
    }
};
const attributeSerializers: Array<ISerializer<any>> = [
    jsxAttributeSerializer
];

const jsxTextSerializer: ISerializer<ts.JsxText> = {
    isApplicable: function is(node): node is ts.JsxText {
        return ts.isJsxText(node);
    },
    serialize: (checker, node, usedPath, modulePath) =>  {
        return aLiteralValue(node.getText().trim());
    }
};
const jsxExpressionSerializer: ISerializer<ts.JsxExpression> = {
    isApplicable: function is(node): node is ts.JsxExpression {
        return ts.isJsxExpression(node);
    },
    serialize: (checker, node, usedPath, modulePath) =>  {
        return generateDataLiteral(checker, node.expression!, usedPath, modulePath);
    }
};
const reactChildSerializers: Array<ISerializer<any>> = [
    jsxTextSerializer,
    jsxExpressionSerializer
];
const reactNodeSerializer: ISerializer<ts.JsxElement | ts.JsxSelfClosingElement | ts.JsxFragment> = {
    isApplicable: function is(node): node is ts.JsxElement | ts.JsxSelfClosingElement | ts.JsxFragment {
        return ts.isJsxSelfClosingElement(node) || ts.isJsxElement(node) || ts.isJsxFragment(node);
    },
    serialize: (checker, node, usedPath, modulePath) =>  {
        const startNode = ts.isJsxElement(node) ? node.openingElement : node;

        const tagName = ts.isJsxFragment(startNode) ? 'dom/fragment' : 'dom/' + startNode.tagName.getText();
        const attributes: ts.NodeArray<ts.JsxAttributeLike> = ts.isJsxFragment(startNode) ? ([] as any) : startNode.attributes.properties;
        let children: any[] = [];
        const attributeOutputs = attributes.map((attribute) => {
            const serializer = attributeSerializers.find((optionalSerializer) => optionalSerializer.isApplicable(attribute));
            if (serializer) {
                return serializer.serialize(checker, attribute as any, usedPath, modulePath );
            }
            return {
                name: ''
            };
        });
        if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
            children = node.children.map((item) => {
                const serializer = reactChildSerializers.find((optionalSerializer) => optionalSerializer.isApplicable(item));
                if (serializer) {
                    return serializer.serialize(checker, item as any, usedPath, modulePath ).value;
                }
                return {
                    name: ''
                };
            });
        }

        const extra: any = {
            id: tagName
        };
        if (attributeOutputs.length) {
                extra.attributes = attributeOutputs;
        }
        if (children.length) {
                extra.children = children;
        }
        return aProcessedExpression('jsx-node', node.getText(), extra);
    }
};
reactChildSerializers.push(reactNodeSerializer);

const dataLiteralSerializers: Array<ISerializer<any>> = [
    stringLiteralSerializer,
    numericLiteralSerializer,
    booleanLiteralSerializer,
    objectLiteralSerializer,
    objectBindingSerializer,
    arrayLiteralSerializer,
    propertyAccessSerializer,
    identifierSerializer,
    callExpressionSerializer,
    newExpressionSerializer,
    reactNodeSerializer,
    trinaryExpressionSerializer,
    notExpressionSerializer,
    binaryExpressionSerializer,
    parenthesisSerializer
];
export function generateDataLiteral(checker: ts.TypeChecker, node: ts.Node, usedPath: IFileSystemPath, modulePath: string = '', ): ILiteralInferenceResult | IExpressionInferenceResult {
    const serializer = dataLiteralSerializers.find((optionalSerializer) => optionalSerializer.isApplicable(node));
    if (serializer) {
        return serializer.serialize(checker, node as any, usedPath, modulePath );
    }
    return anExpression(undefined, node.getText());
}

function getIdFromExpression(checker: ts.TypeChecker, node: ts.Expression, modulePath: string, pathUtil: IFileSystemPath) {

    const referencedSymb = checker.getSymbolAtLocation(node)!;
    if (referencedSymb) {

        const referencedSymbDecl = referencedSymb.valueDeclaration || referencedSymb.declarations[0];
        if (referencedSymbDecl) {
            const importedRef = resolveImportedIdentifier(referencedSymbDecl, modulePath, pathUtil);
            if (importedRef) {
                return importedRef;
            }
        }
    }
    return '#' + node.getText();
}
