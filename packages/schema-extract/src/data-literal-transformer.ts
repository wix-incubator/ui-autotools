import ts from 'typescript';
import {  resolveImportedIdentifier, IFileSystemPath} from './imported-identifier-resolver';

export interface ILiteralInferenceResult<VALUE = any> {
    isLiteral: true;
    value: VALUE;
    name?: string;
}

export interface IExpressionInferenceResult<VALUE = any> {
    isLiteral: false;
    value: VALUE;
    expression: string;
}

export interface IExctractorEnv {
    checker: ts.TypeChecker;
    pathUtil: IFileSystemPath;
    modulePath: string;
}
export function isOfType<TYPE, SERIALIZED_TYPE>(type: SERIALIZED_TYPE): (item: any) => item is TYPE {
    return ((item: any) => item.__serilizedType === type) as any;
}
export const IReferenceCall = 'reference-call';
export const isReferenceCall = isOfType<IReferenceCall, typeof IReferenceCall>(IReferenceCall);
export interface IReferenceCall {
    __serilizedType: typeof IReferenceCall;
    args: any[];
    $ref: string;
    innerPath?: any[];
}

export const IReferenceConstruct = 'reference-construct';
export const isReferenceConstruct = isOfType<IReferenceConstruct, typeof IReferenceConstruct>(IReferenceConstruct);
export interface IReferenceConstruct {
    __serilizedType: typeof IReferenceConstruct;
    args: any[];
    $ref: string;
    innerPath?: any[];
}

export const IReferenceSpread = 'reference-spread';
export const isReferenceSpread = isOfType<IReferenceSpread, typeof IReferenceSpread>(IReferenceSpread);
export interface IReferenceSpread {
    __serilizedType: typeof IReferenceSpread;
    $ref: string;
    innerPath?: any[];
}

export const IReference = 'reference';
export const isReference = isOfType<IReference, typeof IReference>(IReference);
export interface IReference {
    __serilizedType: typeof IReference;
    $ref: string;
    innerPath?: any[];
}

export const ICommonIf = 'common/if';
export const isCommonIf = isOfType<ICommonIf, typeof ICommonIf>(ICommonIf);
export interface ICommonIf {
    __serilizedType: typeof ICommonIf;
    condition: any;
    whenTrue: any;
    whenFalse: any;
}
export const ICommonNot = 'common/not-operator';
export const isCommonNot = isOfType<ICommonNot, typeof ICommonNot>(ICommonNot);
export interface ICommonNot {
    __serilizedType: typeof ICommonNot;
    expression: any;
}
export const IJSXAttribute = 'jsx-attribute';
export const isJSXAttribute = isOfType<IJSXAttribute, typeof IJSXAttribute>(IJSXAttribute);
export interface IJSXAttribute {
    __serilizedType: typeof IJSXAttribute;
    name?: string;
    value: any;
}
export const IJSXNode = 'jsx-node';
export const isJSXNode = isOfType<IJSXNode, typeof IJSXNode>(IJSXNode);
export interface IJSXNode {
    __serilizedType: typeof IJSXNode;
    $ref: string;
    attributes?: IJSXAttribute[];
    children?: any[];
}

export const IFunction = 'function';
export const isFunction = isOfType<IFunction, typeof IFunction>(IFunction);
export interface IFunction {
    __serilizedType: typeof IFunction;
    arguments: any[];
    returns: any[];
}

export const FRAGMENT_REF = 'dom/fragment';

interface ISerializer<INPUT extends ts.Node, OUTPUT extends ILiteralInferenceResult | IExpressionInferenceResult = ILiteralInferenceResult | IExpressionInferenceResult> {
    isApplicable: (node: ts.Node) => node is INPUT;
    serialize: (env: IExctractorEnv, node: INPUT) => OUTPUT;
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

function aProcessedExpression<T extends string, V extends object = {}>(type: T, expression: string,  extraFields?: V): IExpressionInferenceResult<{__serilizedType: T} & V> {
    const fields = extraFields || {};
    return {
        isLiteral: false,
        value: {
            __serilizedType: type,
            ...fields
        } as any,
        expression
    };
}

function getReferencePath(env: IExctractorEnv, node: ts.Node): {$ref: string, innerPath ?: any[]; } {
    if (propertyAccessSerializer.isApplicable(node)) {
        const res = propertyAccessSerializer.serialize(env, node);
        return {
            $ref: res.value.$ref,
            innerPath: res.value.innerPath
        };
    }
    return {$ref: getIdFromExpression(env, node as any) };
}

const callExpressionSerializer: ISerializer<ts.CallExpression, IExpressionInferenceResult<IReferenceCall>> = {
    isApplicable: function is(node): node is ts.CallExpression {
        return ts.isCallExpression(node);
    },
    serialize: (env, node) =>  {
        const referencePath = getReferencePath(env, node.expression);
        return aProcessedExpression(IReferenceCall, node.getText(), {
            ...referencePath,
            args: node.arguments.map((arg) => generateDataLiteral(env, arg).value)
        });
    }
};
const newExpressionSerializer: ISerializer<ts.NewExpression, IExpressionInferenceResult<IReferenceConstruct>> = {
    isApplicable: function is(node): node is ts.NewExpression {
        return ts.isNewExpression(node);
    },
    serialize: (env, node) =>  {
        const referencePath = getReferencePath(env, node.expression);
        return aProcessedExpression(IReferenceConstruct, node.getText(),  {
            ...referencePath,
            args: node.arguments!.map((arg) => generateDataLiteral(env, arg).value)
        });
    }
};
const spreadExpressionSerializer: ISerializer<ts.JsxSpreadAttribute | ts.SpreadAssignment, IExpressionInferenceResult<IReferenceSpread>> = {
    isApplicable: function is(node): node is ts.JsxSpreadAttribute | ts.SpreadAssignment {
        return ts.isJsxSpreadAttribute(node) || ts.isSpreadAssignment(node);
    },
    serialize: (env, node) =>  {
        const referencePath = getReferencePath(env, node.expression);
        return aProcessedExpression(IReferenceSpread, node.getText(),  {
            ...referencePath
        });
    }
};

const identifierSerializer: ISerializer<ts.Identifier, IExpressionInferenceResult<IReference>> = {
    isApplicable: function is(node): node is ts.Identifier {
        return ts.isIdentifier(node);
    },
    serialize: (env, node) =>  {
        return aProcessedExpression(IReference, node.getText(), {
            $ref: getIdFromExpression(env, node)
        });
    }
};

const stringLiteralSerializer: ISerializer<ts.StringLiteral> = {
    isApplicable: function is(node): node is ts.StringLiteral {
        return ts.isStringLiteral(node);
    },
    serialize: (env, node) =>  {
        return aLiteralValue(node.text);
    }
};

const booleanLiteralSerializer: ISerializer<ts.BooleanLiteral> = {
    isApplicable: function is(node): node is ts.BooleanLiteral {
        return node.getText() === 'true' || node.getText() === 'false';
    },
    serialize: (env, node) =>  {
        return aLiteralValue(node.getText() === 'true');
    }
};
const numericLiteralSerializer: ISerializer<ts.NumericLiteral> = {
    isApplicable: function is(node): node is ts.NumericLiteral {
        return ts.isNumericLiteral(node);
    },
    serialize: (env, node) =>  {
        return  aLiteralValue(parseFloat(node.text));
    }
};

const objectLiteralSerializer: ISerializer<ts.ObjectLiteralExpression> = {
    isApplicable: function is(node): node is ts.ObjectLiteralExpression {
        return ts.isObjectLiteralExpression(node);
    },
    serialize: (env, node) =>  {
        const value: any = {};
        let isLiteral = true;
        let spreadCounter = 0;
        for (const prop of node.properties) {
            if (ts.isPropertyAssignment(prop)) {
                const innerRes = generateDataLiteral(env, prop.initializer);
                isLiteral = isLiteral && innerRes.isLiteral;
                value[prop.name!.getText()] = innerRes.value;
            } else if (spreadExpressionSerializer.isApplicable(prop)) {
                const innerRes = spreadExpressionSerializer.serialize(env, prop);
                isLiteral = isLiteral && innerRes.isLiteral;
                value['__spread' + spreadCounter++] = innerRes.value;
            }
        }
        return isLiteral ?  aLiteralValue(value) : anExpression(value, node.getText());
    }
};

const arrayLiteralSerializer: ISerializer<ts.ArrayLiteralExpression> = {
    isApplicable: function is(node): node is ts.ArrayLiteralExpression {
        return ts.isArrayLiteralExpression(node);
    },
    serialize: (env, node) =>  {
        const value: any[] = [];
        let isLiteral = true;
        for (const element of node.elements) {
            const innerRes = generateDataLiteral(env, element);
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
    serialize: (env, node) =>  {
        const value: any = {};
        let isLiteral = true;
        for (const bindingElement of node.elements) {
            if (!bindingElement.initializer) {
                isLiteral = false;
                value[bindingElement.name!.getText()] = {};
            } else {
                const innerRes = generateDataLiteral(env, bindingElement.initializer);
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
    serialize: (env, node) =>  {
        let currentNode: ts.Node = node;
        const expression: string[] = [];
        do {
            if (ts.isPropertyAccessExpression(currentNode)) {
                expression.push(currentNode.name.getText());
                currentNode = currentNode.expression;
            }
            if (ts.isElementAccessExpression(currentNode)) {
                const innerValue = generateDataLiteral(env, currentNode.argumentExpression);
                expression.push(innerValue.value);
                currentNode = currentNode.expression;
            }
        } while (ts.isPropertyAccessExpression(currentNode) || ts.isElementAccessExpression(currentNode));

        const $ref = getIdFromExpression(env, currentNode as ts.Expression);
        return aProcessedExpression(IReference, node.getText(), {$ref, innerPath: expression.reverse()});
    }
};
const trinaryExpressionSerializer: ISerializer<ts.ConditionalExpression, IExpressionInferenceResult<ICommonIf>> = {
    isApplicable: function is(node): node is ts.ConditionalExpression {
        return ts.isConditionalExpression(node) || ts.isElementAccessExpression(node);
    },
    serialize: (env, node) =>  {
       return aProcessedExpression(ICommonIf, node.getText(), {
           condition: generateDataLiteral(env, node.condition).value,
           whenTrue: generateDataLiteral(env, node.whenTrue).value,
           whenFalse: generateDataLiteral(env, node.whenFalse).value
       });
    }
};

const notExpressionSerializer: ISerializer<ts.PrefixUnaryExpression, IExpressionInferenceResult<ICommonNot>> = {
    isApplicable: function is(node): node is ts.PrefixUnaryExpression {
        return ts.isPrefixUnaryExpression(node) && ts.SyntaxKind.ExclamationToken === node.operator;
    },
    serialize: (env, node) =>  {
       return aProcessedExpression(ICommonNot, node.getText(), {
           expression: generateDataLiteral(env, node.operand).value
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
    serialize: (env, node) =>  {
       const typeStr = supportedBinaryOperatorsNames[node.operatorToken.kind];
       return aProcessedExpression(typeStr, node.getText(), {
          firstOption: generateDataLiteral(env, node.left).value,
          secondOption: generateDataLiteral(env, node.right).value
       });
    }
};

const parenthesisSerializer: ISerializer<ts.ParenthesizedExpression> = {
    isApplicable: function is(node): node is ts.ParenthesizedExpression {
        return ts.isParenthesizedExpression(node);
    },
    serialize: (env, node) =>  {
       return {
            ...generateDataLiteral(env, node.expression),
            expression: node.getText()};
    }
};
const jsxAttributeSerializer: ISerializer<ts.JsxAttribute, IExpressionInferenceResult<IJSXAttribute>> = {
    isApplicable: function is(node): node is ts.JsxAttribute {
        return ts.isJsxAttribute(node);
    },
    serialize: (env, node) =>  {
        if (!node.initializer) {
            return aProcessedExpression(IJSXAttribute, node.getText(), {
                name: node.name.getText(),
                value: true,
                isLiteral: true
            });
        }
        const initializer = node.initializer;
        if (ts.isStringLiteral(initializer)) {
            return aProcessedExpression(IJSXAttribute, node.getText(), {
                name: node.name.getText(),
                value: initializer.text,
                isLiteral: true
            });
        } else {
            const res = generateDataLiteral(env, initializer.expression!);
            return aProcessedExpression(IJSXAttribute, node.getText(), {
                ...res,
                name: node.name.getText(),
            });
        }
    }
};
const attributeSerializers: Array<ISerializer<any>> = [
    jsxAttributeSerializer,
    spreadExpressionSerializer
];

const jsxTextSerializer: ISerializer<ts.JsxText> = {
    isApplicable: function is(node): node is ts.JsxText {
        return ts.isJsxText(node);
    },
    serialize: (env, node) =>  {
        return aLiteralValue(node.getText().trim());
    }
};
const jsxExpressionSerializer: ISerializer<ts.JsxExpression> = {
    isApplicable: function is(node): node is ts.JsxExpression {
        return ts.isJsxExpression(node);
    },
    serialize: (env, node) =>  {
        return generateDataLiteral(env, node.expression!);
    }
};
const reactChildSerializers: Array<ISerializer<any>> = [
    jsxTextSerializer,
    jsxExpressionSerializer
];
function startsWithLowerCase(str: string) {
    return str.charAt(0).toUpperCase() !== str.charAt(0);
}
const reactNodeSerializer: ISerializer<ts.JsxElement | ts.JsxSelfClosingElement | ts.JsxFragment, IExpressionInferenceResult<IJSXNode>> = {
    isApplicable: function is(node): node is ts.JsxElement | ts.JsxSelfClosingElement | ts.JsxFragment {
        return ts.isJsxSelfClosingElement(node) || ts.isJsxElement(node) || ts.isJsxFragment(node);
    },
    serialize: (env, node) =>  {
        const startNode = ts.isJsxElement(node) ? node.openingElement : node;

        const tagName = ts.isJsxFragment(startNode) ? FRAGMENT_REF :
                        startsWithLowerCase(startNode.tagName.getText()) ? 'dom/' + startNode.tagName.getText() :
                        getIdFromExpression(env, startNode.tagName);
        const attributes: ts.NodeArray<ts.JsxAttributeLike> = ts.isJsxFragment(startNode) ? ([] as any) : startNode.attributes.properties;
        let children: any[] = [];
        const attributeOutputs = attributes.map((attribute) => {
            const serializer = attributeSerializers.find((optionalSerializer) => optionalSerializer.isApplicable(attribute));
            if (serializer) {
                return serializer.serialize(env, attribute as any).value;
            }
            return {
                name: ''
            };
        });
        if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
            children = node.children.map((item) => {
                const serializer = reactChildSerializers.find((optionalSerializer) => optionalSerializer.isApplicable(item));
                if (serializer) {
                    return serializer.serialize(env, item as any).value;
                }
                return {
                    name: ''
                };
            });
        }

        const extra: Partial<IJSXNode> = {
            $ref: tagName
        };
        if (attributeOutputs.length) {
            extra.attributes = attributeOutputs;
        }
        if (children.length) {
            extra.children = children;
        }
        return aProcessedExpression(IJSXNode, node.getText(), extra as IJSXNode);
    }
};
reactChildSerializers.push(reactNodeSerializer);
const functionSerializer: ISerializer<ts.ArrowFunction | ts.FunctionExpression, IExpressionInferenceResult<IFunction>> = {
    isApplicable: function is(node): node is ts.ArrowFunction | ts.FunctionExpression {
        return ts.isArrowFunction(node) || ts.isFunctionExpression(node);
    },
    serialize: (env, node) =>  {
        let returnValues: any[] = [];
        if (ts.isArrowFunction(node) && !ts.isBlock(node.body)) {
            returnValues =  [generateDataLiteral(env, node.body).value];
        } else if (node.body) {
            returnValues = findReturnStatements(node.body).map((statement) =>
                generateDataLiteral(env, statement.expression!).value
            );
        }
        return aProcessedExpression(IFunction, node.getText(), {
            returns: returnValues,
            arguments: node.parameters.map((param) => param.name.getText())
        });
    }
};

export function findReturnStatements(node: ts.Node): ts.ReturnStatement[] {
    if (ts.isArrowFunction(node) || ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node)) {
        return [];
    }
    let res: ts.ReturnStatement[] = [];
    for (const childDecl of node.getChildren()) {
        if (ts.isReturnStatement(childDecl)) {
            res.push(childDecl);
        } else {
            res = res.concat(findReturnStatements(childDecl));
        }
    }
    return res;
}
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
    parenthesisSerializer,
    functionSerializer
];
export function generateDataLiteral(env: IExctractorEnv, node: ts.Node): ILiteralInferenceResult | IExpressionInferenceResult {
    const serializer = dataLiteralSerializers.find((optionalSerializer) => optionalSerializer.isApplicable(node));
    if (serializer) {
        return serializer.serialize(env, node as any );
    }
    return anExpression(undefined, node.getText());
}

function getIdFromExpression(env: IExctractorEnv, node: ts.Expression) {

    const referencedSymb = env.checker.getSymbolAtLocation(node)!;
    if (referencedSymb) {

        const referencedSymbDecl = referencedSymb.valueDeclaration || referencedSymb.declarations[0];
        if (referencedSymbDecl) {
            const importedRef = resolveImportedIdentifier(referencedSymbDecl, env.modulePath, env.pathUtil);
            if (importedRef) {
                return importedRef;
            }
        }
    }
    return '#' + node.getText();
}
