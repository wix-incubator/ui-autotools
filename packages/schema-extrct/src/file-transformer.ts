import * as ts from 'typescript'
import {ModuleSchema, Schema, NullSchemaId, UndefinedSchemaId, FunctionSchemaId, isSchemaOfType, FunctionSchema, ClassSchema, ClassConstructorSchema, ClassConstructorSchemaId, ClassConstructorPairSchema, ClassSchemaId} from './json-schema-types'
// import * as types from './json-schema-types'
import * as path from 'path'

// console.log(types)
const posix: typeof path.posix = path.posix ? path.posix : path

export interface IEnv {
    modulePath: string
    projectPath: string
}

export function transform(checker: ts.TypeChecker, sourceFile: ts.SourceFile, moduleId: string, projectPath: string) {
    const moduleSymbol = (sourceFile as any).symbol
    const res: ModuleSchema = {
        $schema: 'http://json-schema.org/draft-06/schema#',
        $id: moduleId,
        $ref: 'common/module',
        properties: {},
    }
    if (!moduleSymbol) {
        return res
    }
    const env: IEnv =  {
        modulePath: moduleId,
        projectPath,
    }
    const exports = checker.getExportsOfModule(moduleSymbol)

    // tslint:disable-next-line:no-unused-expression
    ts.isAccessor

    exports.forEach((exportObj) => {
        const node = getNode(exportObj)!
        if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) {
            res.properties![exportObj.getName()] = describeFunction(node, checker, env, exportObj)
        } else if (ts.isClassDeclaration(node)) {
            res.definitions = res.definitions || {}
            const classDefInitions = describeClass(node, checker, env)
            const className = exportObj.getName()
            res.definitions[className] = classDefInitions.class_def
            res.definitions['typeof ' + className] = classDefInitions.constructor_def
            res.properties![className] = {
                $ref: '#typeof ' + className,
            }
        } else {
            let exportSchema: Schema = {}
            let isTypeOnly: boolean = false
            if ( ts.isVariableDeclaration(node)) {
                exportSchema = describeVariableDeclaration(node, checker, env, exportObj)
            } else if (ts.isExportSpecifier(node)) {
                exportSchema = exportSpecifierDescriber(node, checker, env, exportObj)
            } else if (ts.isExportAssignment(node)) {
                exportSchema = assignmentDescriber(node, checker, env, exportObj)
            } else if (ts.isTypeAliasDeclaration(node)) {
                isTypeOnly = true
                exportSchema = describeTypeAlias(node, checker, env)
            } else if (ts.isInterfaceDeclaration(node)) {
                isTypeOnly = true
                exportSchema = describeInterface(node, checker, env)
            }
            const documentation = exportObj.getDocumentationComment(checker)
            if (documentation.length) {
                exportSchema.description = documentation.map((doc) => doc.text).join('\n')
            }

            const tags = exportObj.getJsDocTags()
            if (tags.length) {
                for (const tag of tags) {
                    if (tag.text) {
                        (exportSchema as any)[tag.name] = isNaN(parseFloat(tag.text)) ? tag.text : parseFloat(tag.text)
                    }
                }
            }

            if (isTypeOnly) {
                res.definitions = res.definitions || {}
                res.definitions![exportObj.getName()] = exportSchema
            } else {
                res.properties![exportObj.getName()] = exportSchema
            }
        }
    })
    return res
}

export type TsNodeDescriber<N extends ts.Node, S extends Schema = Schema> = (n: N, checker: ts.TypeChecker, env: IEnv, symb?: ts.Symbol) => S

function getNode(symb: ts.Symbol): ts.Node | undefined {
    if (!symb) {
        return undefined
    }
    if (symb.valueDeclaration) {
        return symb.valueDeclaration
    }
    if (symb.declarations) {
        return symb.declarations[0]
    }
    return undefined
}

const exportSpecifierDescriber: TsNodeDescriber<ts.ExportSpecifier> = (decl, checker, env, symb) => {
    const aliasedSymb = checker.getAliasedSymbol(symb!)
    if (aliasedSymb) {
        const aliasedNode = getNode(aliasedSymb)
        if (aliasedNode && ts.isVariableDeclaration(aliasedNode)) {
            return describeVariableDeclaration(aliasedNode, checker, env, aliasedSymb)
        }
    }

    const exportClause = decl.parent!.parent!
    if (ts.isExportDeclaration(exportClause) && exportClause.moduleSpecifier) {
        return {
            $ref: resolveImportPath(exportClause.moduleSpecifier!.getText().slice(1, -1), '#typeof ' + symb!.name, env),
        }
    }
    return {}
}

const assignmentDescriber: TsNodeDescriber<ts.ExportAssignment | ts.ExpressionWithTypeArguments> = (decl, checker, env, symb) => {
    const expression: ts.Node = decl.expression
    if (ts.isIdentifier(expression)) {

        return describeIdentifier(expression, checker, env)
    } else {
        const t = checker.getTypeAtLocation(expression)
        return serializeType(t, decl, checker, env)
    }

    // return resolveNode(decl.expression, checker, env);
}

const describeVariableDeclaration: TsNodeDescriber<ts.VariableDeclaration | ts.PropertySignature | ts.ParameterDeclaration | ts.PropertyDeclaration> = (decl, checker, env) => {
    let res: Schema | undefined
    if (decl.type) {
        res = describeTypeNode(decl.type!, checker, env)
    } else  if (decl.initializer) {

        if (ts.isIdentifier(decl.initializer)) {
            res =  describeIdentifier(decl.initializer, checker, env)
            res.$ref = res.$ref!.replace('#', '#typeof ')
        } else if (ts.isPropertyAccessExpression(decl.initializer) && ts.isIdentifier(decl.initializer.expression)) {
            res =  describeIdentifier(decl.initializer.expression, checker, env)
            let ref = res.$ref!
            if (ref.includes('#')) {
                ref = ref!.replace('#', '#typeof ') + '.' + decl.initializer.name.getText()
            } else {
                ref += '#typeof ' + decl.initializer.name.getText()
            }
            res = {
                $ref: ref,
            }
        }
    }
    if (!res) {

        res =  serializeType(checker.getTypeAtLocation(decl), decl, checker, env)
    }
    const jsDocs = extraCommentsHack(decl)
    if (jsDocs) {
        if (jsDocs.comment) {
            res!.description = jsDocs.comment
        }

        if (jsDocs.tags) {
            addJsDocsTagsToSchema(jsDocs.tags as any, res!)
        }

    }
    return res!
}

const describeTypeNode: TsNodeDescriber<ts.TypeNode> = (decl, checker, env) => {
    if (ts.isTypeReferenceNode(decl)) {
        return describeTypeReference(decl, checker, env)
    } else if (ts.isTypeLiteralNode(decl)) {
        return describeTypeLiteral(decl, checker, env)
    } else if (ts.isArrayTypeNode(decl)) {
        return describeArrayType(decl, checker, env)
    } else if (ts.isUnionTypeNode(decl)) {
        return describeUnionType(decl, checker, env)
    } else if (ts.isIntersectionTypeNode(decl)) {
        return describeIntersectionType(decl, checker, env)
    } else if (ts.isFunctionTypeNode(decl)) {
        return describeFunction(decl, checker, env)
    }

    const t = checker.getTypeAtLocation(decl)
    return serializeType(t, decl, checker, env)
}

const describeTypeAlias: TsNodeDescriber<ts.TypeAliasDeclaration> = (decl, checker, env) => {
    return describeTypeNode(decl.type, checker, env)
}

const describeInterface: TsNodeDescriber<ts.InterfaceDeclaration> = (decl, checker, env) => {
    const localRes = describeTypeLiteral(decl, checker, env)
    if (decl.heritageClauses) {
        const res: Schema = {
            $allOf: [],
        }
        decl.heritageClauses.forEach((clauese) => {
            clauese.types.forEach((t) => {
                res.$allOf = res.$allOf || []
                res.$allOf.push(assignmentDescriber(t, checker, env))
            })
        })
        res.$allOf!.push(localRes)
        return res
    }
    return localRes
}

const describeFunction: TsNodeDescriber<ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionTypeNode | ts.ConstructorDeclaration | ts.MethodDeclaration, FunctionSchema> = (decl, checker, env) => {
    const returns = getReturnSchema(decl, checker, env)
    const funcArguments: Schema[] = []
    let restSchema: Schema<'array'> | undefined
    decl.parameters.forEach((p) => {
        // tslint:disable-next-line:no-shadowed-variable
        const res = describeVariableDeclaration(p, checker, env)
        res.name = p.name.getText()
        const tags = ts.getJSDocParameterTags(p)
        const tag = (tags && tags.length) ? (tags.map((t) => t.comment)).join('') : ''
        if (tag) {
            res.description = tag
        }
        if (p.dotDotDotToken) {
            restSchema = res as Schema<'array'>
        } else {
            funcArguments.push(res)
        }
    })

    const res: FunctionSchema = {
        $ref: FunctionSchemaId,
        arguments : funcArguments,
        returns,
    }
    const comments = checker.getSignatureFromDeclaration(decl)!.getDocumentationComment(checker)
    // tslint:disable-next-line:no-shadowed-variable
    const comment = comments.length ? (comments.map((comment) => comment.kind === 'lineBreak' ? comment.text : comment.text.trim().replace(/\r\n/g, '\n')).join('')) : ''
    if (comment) {
        res.description = comment
    }
    if (restSchema) {
        res.restArgument = restSchema
    }
    return res
}

const getReturnSchema: TsNodeDescriber<ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionTypeNode | ts.ConstructorDeclaration | ts.MethodDeclaration, FunctionSchema> = (decl, checker, env) => {
    const returnSchema = decl.type ? describeTypeNode(decl.type, checker, env) : serializeType(checker.getTypeAtLocation(decl), decl , checker, env).returns!
    const returnTag = ts.getJSDocReturnTag(decl)
    if (returnTag && returnTag.comment) {
        returnSchema.description = returnTag.comment
    }
    return returnSchema
}

const describeClass: TsNodeDescriber<ts.ClassDeclaration, ClassConstructorPairSchema> = (decl, checker, env) => {
    const className = decl.name!.getText()
    let extendRef: Schema | undefined
    if (decl.heritageClauses) {
        decl.heritageClauses.forEach((node) => {
            if (node.token === ts.SyntaxKind.ExtendsKeyword) {
                extendRef = assignmentDescriber(node.types[0], checker, env)
            }
        })
    }

    let constructorSign: FunctionSchema | undefined
    const properties: {[key: string]: Schema} = {}
    const staticProperties: {[key: string]: Schema} = {}
    decl.members.forEach((member) => {
        if (ts.isConstructorDeclaration(member)) {
            constructorSign = describeFunction(member, checker, env)
            member.parameters.forEach(((p) => {
                if (hasModifier(p, ts.SyntaxKind.PublicKeyword)) {
                    properties[p.name.getText()] = describeVariableDeclaration(p, checker, env)
                }
            }))
        } else if (!hasModifier(member, ts.SyntaxKind.PrivateKeyword) && member.name) {
            let schema: Schema = {}
            if (ts.isPropertyDeclaration(member)) {

                schema = describeVariableDeclaration(member, checker, env)
            } else if (ts.isMethodDeclaration(member)) {
                schema = describeFunction(member, checker, env)
            }
            if (hasModifier(member, ts.SyntaxKind.StaticKeyword)) {
                staticProperties[member.name!.getText()] = schema
            } else {
                properties[member.name!.getText()] = schema
            }
        }
    })

    const comments = checker.getSymbolAtLocation(decl.name!)!.getDocumentationComment(checker)
    // tslint:disable-next-line:no-shadowed-variable
    const comment = comments.length ? (comments.map((comment) => comment.kind === 'lineBreak' ? comment.text : comment.text.trim().replace(/\r\n/g, '\n')).join('')) : ''

    const classDef: ClassSchema = {
        $ref: ClassSchemaId,
        constructor: {
            $ref: '#typeof ' + className,
        },
        properties,
    }
    if (comment) {
        classDef.description = comment
    }

    const classConstructorDef: ClassConstructorSchema = {
        $ref: ClassConstructorSchemaId,
        returns: {
            $ref: '#' + className,
        },
        properties: staticProperties,
        arguments: constructorSign ? constructorSign.arguments : [],
    }
    if (constructorSign && constructorSign.description) {
        classConstructorDef.description = constructorSign.description
    }
    if (constructorSign && constructorSign.restArgument) {
        classConstructorDef.restArgument = constructorSign.restArgument
    }
    if (extendRef && extendRef.$ref) {
        classDef.extends = {
            $ref: extendRef.$ref,
        }
        classConstructorDef.extends = {
            $ref: extendRef.$ref!.replace('#', '#typeof '),
        }
    }

    return {
        class_def: classDef,
        constructor_def: classConstructorDef,
    }

  }

const describeTypeReference: TsNodeDescriber<ts.TypeReferenceNode> = (decl, checker, env) => {
    const typeName = decl.typeName
    if (ts.isQualifiedName(typeName)) {
       return describeQualifiedName(typeName, checker, env)
    } else {
        const res = describeIdentifier(typeName, checker, env)
        const typeArgs = decl.typeArguments
        if (typeArgs) {
            if (isSchemaOfType('array', res)) {
                res.items = describeTypeNode(decl.typeArguments![0], checker, env)
            }
        }
        return res
    }
}

const describeQualifiedName: TsNodeDescriber<ts.QualifiedName> = (decl, checker, env) => {
    if (ts.isIdentifier(decl.left)) {
        const identifierRef = describeIdentifier(decl.left, checker, env).$ref || ''
        const innerRef = decl.right.getText()
        return {
            $ref: identifierRef.includes('#') ?
                    identifierRef + '.' + innerRef :
                    identifierRef + '#' + innerRef,
        }
    } else {
        // tslint:disable-next-line:no-debugger
        debugger
    }
    return {}
}

const describeIdentifier: TsNodeDescriber<ts.Identifier> = (decl, checker, env) => {
    if (decl.getText() === 'Array') {
        return {
            type: 'array',
        }
    }
    if (decl.getText() === 'Object') {
        return {
            type: 'object',
        }
    }
    const referencedSymb = checker.getSymbolAtLocation(decl)!
    const referencedSymbDecl = getNode(referencedSymb)
    let importPath: string  = ''
    let importInternal: string = ''
    if (referencedSymbDecl) {
        if (ts.isVariableDeclaration(referencedSymbDecl)) {
            return describeVariableDeclaration(referencedSymbDecl, checker, env)
        } else if (ts.isNamespaceImport(referencedSymbDecl)) {
            const target = referencedSymbDecl.parent!.parent!.moduleSpecifier.getText().slice(1, -1)
            importPath = target
            importInternal = ''
        } else if (ts.isImportSpecifier(referencedSymbDecl)) {
            const target = referencedSymbDecl.parent!.parent!.parent!.moduleSpecifier.getText().slice(1, -1)
            importPath = target
            importInternal = '#' + referencedSymbDecl.getText()
        } else if (ts.isImportClause(referencedSymbDecl)) {
            const target = referencedSymbDecl.parent!.moduleSpecifier.getText().slice(1, -1)
            importPath = target
        } else {
            importInternal = '#' + referencedSymb.name
        }

        if (importPath) {
            return {
                $ref: resolveImportPath(importPath, importInternal, env),
            }

        }
        return {
            $ref: importInternal,
        }
    } else {
        // debugger;
        return {

        }
    }

}

function resolveImportPath(relativeUrl: string, importInternal: string, env: IEnv) {
    if (relativeUrl.startsWith('.') || relativeUrl.startsWith('/')) {
        const currentDir = posix.dirname(env.modulePath)
        const resolvedPath = posix.join(currentDir , relativeUrl)

        return resolvedPath + importInternal
    }

    return relativeUrl + importInternal
}

const describeTypeLiteral: TsNodeDescriber<ts.TypeLiteralNode | ts.InterfaceDeclaration> = (decl, checker, env) => {
    const res: Schema<'object'>  = {
        type: 'object',
    }
    decl.members.forEach((member) => {
        if (ts.isPropertySignature(member)) {
            res.properties = res.properties || {}
            res.properties[member.name.getText()] = describeVariableDeclaration(member, checker, env)
        } else if (ts.isIndexSignatureDeclaration(member)) {
            res.additionalProperties = describeTypeNode(member.type!, checker, env)
        }

    })
    return res
}

const describeArrayType: TsNodeDescriber<ts.ArrayTypeNode> = (decl, checker, env) => {
    const res: Schema<'array'>  = {
        type: 'array',
        items: describeTypeNode(decl.elementType, checker, env),
    }

    return res
}

const describeIntersectionType: TsNodeDescriber<ts.IntersectionTypeNode> = (decl, checker, env) => {
    const schemas: Schema[] = decl.types.map((t) => {
        return describeTypeNode(t, checker, env)
    })

    const res: Schema = {
        $allOf: schemas,
    }

    return res
}

const describeUnionType: TsNodeDescriber<ts.UnionTypeNode> = (decl, checker, env) => {
    const schemas: Schema[] = decl.types.map((t) => {
        return describeTypeNode(t, checker, env)
    })
    const groupedSchemas: Schema[] = []
    let specificString: Schema | undefined
    let specificNumber: Schema | undefined
    schemas.forEach((s) => {
        if (s.type === 'string' && s.enum) {
            specificString = specificString || {
                type: 'string',
                enum: [],
            }
            specificString.enum = specificString.enum!.concat(s.enum)
        } else if (s.type === 'number' && s.enum) {
            specificNumber = specificNumber || {
                type: 'number',
                enum: [],
            }
            specificNumber.enum = specificNumber.enum!.concat(s.enum)
        } else {
            groupedSchemas.push(s)
        }
    })
    if (specificString) {
        groupedSchemas.push(specificString)
    }

    if (specificNumber) {
        groupedSchemas.push(specificNumber)
    }

    const res: Schema = {
        $oneOf: groupedSchemas,
    }

    return res
}

function isUnionType(t: ts.Type): t is ts.UnionType {
    return !!(t as any).types
}

function removeExtension(pathName: string): string {
    return pathName.slice(0, posix.extname(pathName).length * -1)
}

const supportedPrimitives = ['string', 'number', 'boolean']
function serializeType(t: ts.Type, rootNode: ts.Node, checker: ts.TypeChecker, env: IEnv): Schema<any> {
    if (t.aliasSymbol) {
        return {
            $ref: '#' + t.aliasSymbol.name,
        }
    } else if (t.symbol) {
        const node = getNode(t.symbol)

        if (node && (ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node))) {

            const fileName = node.getSourceFile().fileName
            const currentFileName = rootNode.getSourceFile().fileName
            if (fileName !== currentFileName) {
                const fileNameNoExt = removeExtension(fileName)
                const pathInProj = fileNameNoExt.slice(env.projectPath.length)
                return {
                    $ref: pathInProj + '#' + t.symbol.name,
                }
            }

            return {
                $ref: '#' + t.symbol.name,
            }
        }
    }
    const typeString = checker.typeToString(t)
    if (supportedPrimitives.includes(typeString)) {
        return {
            type: checker.typeToString(t) as any,
        }
    }

    if (isUnionType(t)) {
        return {
            $oneOf: t.types.map((tt) => serializeType(tt, rootNode, checker, env)),
        }

    }
    if (typeString === 'null') {
        return {
            $ref: NullSchemaId,
        }
    }
    if (typeString === 'undefined' || typeString === 'void') {
        return {
            $ref: UndefinedSchemaId,
        }
    }
    if (typeString === 'any') {
        return {

        }
    }

    if (typeString.startsWith('"')) {
        return {
            type: 'string',
            enum: [typeString.slice(1, -1)],
        }
    }

    if (!isNaN(parseFloat(typeString))) {
        return {
            type: 'number',
            enum: [parseFloat(typeString)],
        }
    }

    // currently we support only one call signature
    const signatures = t.getCallSignatures()
    if (signatures.length) {
        const signature = signatures[0]
        // tslint:disable-next-line:no-shadowed-variable
        const res: FunctionSchema = {
            $ref: FunctionSchemaId,
            returns: serializeType(signature.getReturnType(), rootNode, checker, env),
            arguments: signature.getParameters().map((p) => {
                // tslint:disable-next-line:no-shadowed-variable
                const t = checker.getTypeOfSymbolAtLocation(p, rootNode)
                return serializeType(t, rootNode, checker, env)
            }),
        }
        return res
    }

    const properties = checker.getPropertiesOfType(t)

    const res: Schema<'object'> = {
        type: 'object',
    }

    if (properties.length) {
        res.properties = {}
        properties.forEach((prop) => {
            const fieldType = checker.getTypeOfSymbolAtLocation(prop, rootNode)
            res.properties![prop.getName()] = serializeType(fieldType, rootNode, checker, env)
        })
    }

    const indexType = checker.getIndexTypeOfType(t, ts.IndexKind.String)
    if (indexType) {
        res.additionalProperties = serializeType(indexType, rootNode, checker, env)
    }

    return res

}

function hasModifier(node: ts.Node, modifier: number): boolean {
    return !!(node.modifiers && node.modifiers.find((m) => {
        return m.kind === modifier
    }))
}

function extraCommentsHack(node: ts.Node): ts.JSDoc | undefined {
    return (node as any).jsDoc ? (node as any).jsDoc[0] : undefined
}

function addJsDocsTagsToSchema(tags: ts.JSDocTag[], schema: Schema) {
    if (tags.length) {
        for (const tag of tags) {
            if (tag.comment) {
                (schema as any)[tag.tagName.escapedText as any] = isNaN(parseFloat(tag.comment)) ? tag.comment : parseFloat(tag.comment)
            }
        }
    }
}
