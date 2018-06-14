import * as ts from 'typescript';
import {ModuleSchema, Schema, NullSchemaId, UndefinedSchemaId, FunctionSchemaId, isSchemaOfType, FunctionSchema, ClassSchema, ClassConstructorSchema, ClassConstructorSchemaId, ClassConstructorPairSchema, ClassSchemaId} from './json-schema-types';
import * as types from './json-schema-types';
import * as path from 'path';


console.log(types);
const posix:typeof path.posix = path.posix ? path.posix : path;

export type Env = {
    moduleId:string
} 

export function transform(checker: ts.TypeChecker, sourceFile:ts.SourceFile, moduleId:string){
    const moduleSymbol = (sourceFile as any).symbol;
    const env:Env =  {
        moduleId
    };
    const exports = checker.getExportsOfModule(moduleSymbol);
    const res: ModuleSchema = {
        '$schema':'http://json-schema.org/draft-06/schema#',
        '$id':moduleId,
        '$ref':'common/module',
        'properties':{}
    };
    ts.isAccessor;
    (window as any).ts = ts;
    (window as any).sourceFile = sourceFile;

    exports.forEach((exportObj) => {
        const node = getNode(exportObj);
        if( ts.isVariableDeclaration(node)){
            res.properties![exportObj.getName()] = decribeVariableDeclaration(node, checker, env, exportObj)
        }else if(ts.isExportSpecifier(node)){
            res.properties![exportObj.getName()] = exportSpecifierDescriber(node, checker, env, exportObj)
        }else if(ts.isExportAssignment(node)){
            res.properties![exportObj.getName()] = assignmentDescriber(node, checker, env, exportObj)
        }else if(ts.isTypeAliasDeclaration(node)){
            res.definitions = res.definitions || {};
            res.definitions![exportObj.getName()] = describeTypeAlias(node, checker, env);
        }else if(ts.isInterfaceDeclaration(node)){
            res.definitions = res.definitions || {};
            res.definitions![exportObj.getName()] = describeInterface(node, checker, env)
        }else if(ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)){
            res.properties![exportObj.getName()] = describeFunction(node, checker, env, exportObj)
        }else if(ts.isClassDeclaration(node)){
            res.definitions = res.definitions || {};            
            const classDefInitions = describeClass(node, checker, env);
            const className = exportObj.getName()
            res.definitions[className] = classDefInitions.class_def;
            res.definitions['typeof '+className] = classDefInitions.constructor_def;
            res.properties![className] = {
                $ref:'#typeof '+className
            } 
        }
    });
    return res;
}


export type TsNodeDescriber<N extends ts.Node, S extends Schema = Schema> = (n:N, checker:ts.TypeChecker, env:Env, symb?:ts.Symbol)=>S


function getNode(symb:ts.Symbol):ts.Node{
    return symb.valueDeclaration || symb.declarations![0]!
}

const exportSpecifierDescriber:TsNodeDescriber<ts.ExportSpecifier> = (decl, checker, env, symb) =>{
    const aliasedSymb = checker.getAliasedSymbol(symb!);
    const aliasedNode = getNode(aliasedSymb);
    if(ts.isVariableDeclaration(aliasedNode)){
        return decribeVariableDeclaration(aliasedNode, checker, env, aliasedSymb)
    }
    else{
        debugger;
        return {}
    }
}


const assignmentDescriber:TsNodeDescriber<ts.ExportAssignment | ts.ExpressionWithTypeArguments> = (decl, checker, env, symb) =>{
    const expression:ts.Node = decl.expression;
    if(ts.isIdentifier(expression)){
        
        return describeIdentifier(expression, checker, env)
    }else {
        const t = checker.getTypeAtLocation(expression);
        return serializeType(t, decl,checker);
    }
 
    //return resolveNode(decl.expression, checker, env);
}





const decribeVariableDeclaration:TsNodeDescriber<ts.VariableDeclaration | ts.PropertySignature | ts.ParameterDeclaration | ts.PropertyDeclaration> = (decl, checker, env) =>{
    if(decl.type){
        return describeTypeNode(decl.type!, checker, env);
    }
    if(decl.initializer && ts.isIdentifier(decl.initializer)){
        const res =  describeIdentifier(decl.initializer, checker, env);
        res.$ref = res.$ref!.replace('#','#typeof '); 
        return res;
    }
    return serializeType(checker.getTypeAtLocation(decl), decl, checker);
}

const describeTypeNode:TsNodeDescriber<ts.TypeNode> = (decl, checker, env) =>{
    if(ts.isTypeReferenceNode(decl)){
        return describeTypeReference(decl, checker, env)
    }else if(ts.isTypeLiteralNode(decl)){
        return describeTypeLiteral(decl, checker, env)   
    }else if(ts.isArrayTypeNode(decl)){
        return describeArrayType(decl, checker, env)
    }else if(ts.isUnionTypeNode(decl)){
        return describeUnionType(decl, checker, env);
    }else if(ts.isIntersectionTypeNode(decl)){
        return describeIntersectionType(decl, checker, env);        
    }else if(ts.isFunctionTypeNode(decl)){
        return describeFunction(decl, checker, env)
    }
   
    const t = checker.getTypeAtLocation(decl);
    return serializeType(t, decl, checker);
}


const describeTypeAlias:TsNodeDescriber<ts.TypeAliasDeclaration> = (decl, checker, env) =>{
    const res =  describeTypeNode(decl.type,checker,env);
    if (decl.typeParameters) {
        res.genericParams = decl.typeParameters.map(t => { return {name: t.name.getText()}});
    }
    return res;
}

const describeInterface:TsNodeDescriber<ts.InterfaceDeclaration> = (decl, checker, env) =>{
    const localRes = describeTypeLiteral(decl, checker, env);
    if(decl.heritageClauses){
        const res:Schema = {
            $allOf:[]
        }
        decl.heritageClauses.forEach(clauese=>{
            clauese.types.forEach(t=>{
                res.$allOf = res.$allOf || [];
                res.$allOf.push(assignmentDescriber(t, checker, env)) 
            })
        })
        res.$allOf!.push(localRes);
        return res;
    }
    // if (decl.typeParameters) {
        // const generics = decl.typeParameters.map(t => { 
            // let res:Schema = {};
            // return {name: t.name.getText(),
            //         type: checker.typeToString(checker.getTypeAtLocation(t.constraint!), t)
            // }
            
            // if (t.default) {
            //     if (ts.isLiteralTypeNode(t)) {
            //         res.default = ts.isNumericLiteral(t.literal) ? parseFloat(t.literal.getText()) : t.literal.getText();
            //     } else {
            //         res.default = '';
            //     }
            // }
    // });
        // localRes.generics = generics;
    // }
    return localRes;
}

const describeFunction:TsNodeDescriber<ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionTypeNode | ts.ConstructorDeclaration | ts.MethodDeclaration, FunctionSchema> = (decl, checker, env) =>{
    const returns = decl.type ? describeTypeNode(decl.type, checker, env) : serializeType(checker.getTypeAtLocation(decl),decl , checker).returns!
    const funcArguments:Schema[] = [];
    let restSchema:Schema<'array'> | undefined;
    decl.parameters.forEach(p=>{
        const res = decribeVariableDeclaration(p, checker, env);
        res.name = p.name.getText();
        if(p.dotDotDotToken){
            restSchema = res as Schema<'array'>;
        }else{
            funcArguments.push(res);
        }
    })
    const res:FunctionSchema = {
        $ref:FunctionSchemaId,
        arguments : funcArguments,
        returns:returns
    }
    if(restSchema){
        res.restArgument = restSchema;
    }
    // if (decl.type && decl.type.kind === ts.SyntaxKind.TypeReference && decl.typeParameters) {
    //     const generics = decl.typeParameters.map(t => { return {name: t.name.getText()}});
    //     res.generics = generics;
    // }
    return res;
}

const describeClass:TsNodeDescriber<ts.ClassDeclaration, ClassConstructorPairSchema> = (decl, checker, env) =>{
    const className = decl.name!.getText();
    let extendRef:Schema | undefined;
    if(decl.heritageClauses){
        decl.heritageClauses.forEach(node=>{
            if(node.token === ts.SyntaxKind.ExtendsKeyword){
                extendRef = assignmentDescriber(node.types[0], checker, env);
            }
        })
    }



    let constructorSign:FunctionSchema | undefined;
    const properties:{[key:string]:Schema} = {};
    const staticProperties:{[key:string]:Schema} = {};
    decl.members.forEach(member=>{
        if(ts.isConstructorDeclaration(member)){
            constructorSign = describeFunction(member, checker, env);
            member.parameters.forEach((p=>{
                if(hasModifier(p, ts.SyntaxKind.PublicKeyword)){
                    properties[p.name.getText()] = decribeVariableDeclaration(p, checker, env)
                }
            }));
        }
        else if(!hasModifier(member, ts.SyntaxKind.PrivateKeyword) && member.name){
            let schema:Schema = {};
            if(ts.isPropertyDeclaration(member)){
                schema = decribeVariableDeclaration(member, checker, env)
            }else if(ts.isMethodDeclaration(member)){
                schema = describeFunction(member, checker, env)
            }
            if(hasModifier(member, ts.SyntaxKind.StaticKeyword)){
                staticProperties[member.name!.getText()] = schema;
            }else{
                properties[member.name!.getText()] = schema;
            }
        }
    });
    
    const classDef:ClassSchema = {
        $ref:ClassSchemaId,
        constructor:{
            $ref:"#typeof "+className
        },
        properties
    }

    const classConstructorDef:ClassConstructorSchema = {
        $ref:ClassConstructorSchemaId,
        returns:{
            $ref:"#"+className
        },
        properties:staticProperties,
        arguments: constructorSign ? constructorSign.arguments : []
    }
    if(constructorSign && constructorSign.restArgument){
        classConstructorDef.restArgument = constructorSign.restArgument;
    };
    if(extendRef){
        classDef.extends = {
            $ref: extendRef.$ref
        }
        classConstructorDef.extends = {
            $ref: extendRef.$ref!.replace('#', '#typeof ')
        }
    }

    return {
        class_def:classDef,
        constructor_def:classConstructorDef
    }

  }

const describeTypeReference:TsNodeDescriber<ts.TypeReferenceNode> = (decl, checker, env) =>{
    const typeName = decl.typeName;
    if(ts.isQualifiedName(typeName)){
       return describeQualifiedName(typeName, checker, env);
    }
    else{
        debugger;
        const res = describeIdentifier(typeName, checker, env);
        const typeArgs = decl.typeArguments;
        if(typeArgs){
            if(isSchemaOfType('array',res)){
                res.items = describeTypeNode(typeArgs[0], checker, env)
            } else {
                //I am not sure what other cases we have except generics 
                //but we need to make sure it is a generic declaration somehow
                res.genericArguments = typeArgs.map(t => {
                    if (ts.isLiteralTypeNode(t)) {
                        return ts.isNumericLiteral(t.literal) ? Number(t.literal.getText()) : t.literal.getText();
                    }
                    return describeTypeNode(t, checker, env)
                });
            }
        }
        return res;
    }
}

const describeQualifiedName:TsNodeDescriber<ts.QualifiedName> = (decl, checker, env) =>{
    if(ts.isIdentifier(decl.left)){
        const identifierRef = describeIdentifier(decl.left, checker, env);
        const innerRef = decl.right.getText();
        return {
            $ref:identifierRef.$ref!.includes('#') ? 
                    identifierRef.$ref + '.' + innerRef :
                    identifierRef.$ref + '#' + innerRef
        };
    }else{
        debugger
    }
    return {};
}


const describeIdentifier:TsNodeDescriber<ts.Identifier> = (decl, checker, env) =>{
    if(decl.getText()==='Array'){
        return {
            type:'array'
        }
    }
    const referencedSymb = checker.getSymbolAtLocation(decl)!;
    const referencedSymbDecl = referencedSymb!.declarations![0];
    let importPath:string | undefined = undefined;
    let importInternal:string | undefined = undefined;
    if(ts.isVariableDeclaration(referencedSymbDecl)){
        return decribeVariableDeclaration(referencedSymbDecl, checker, env)
    }else if(ts.isNamespaceImport(referencedSymbDecl)){
        const target = referencedSymbDecl.parent!.parent!.moduleSpecifier.getText().slice(1,-1);
        importPath = target;
        importInternal = '';
    }else if(ts.isImportSpecifier(referencedSymbDecl)){
        const target = referencedSymbDecl.parent!.parent!.parent!.moduleSpecifier.getText().slice(1,-1);
        importPath = target;
        importInternal = '#'+referencedSymbDecl.getText();
    }else if(ts.isImportClause(referencedSymbDecl)){
        const target = referencedSymbDecl.parent!.moduleSpecifier.getText().slice(1,-1);
        importPath = target;
    }else{
        importInternal = '#'+referencedSymb.name
    }

    if(importPath){
        const currentDir = posix.dirname(env.moduleId);
        const resolvedPath = posix.resolve(currentDir ,importPath);
    
        return {
            $ref:resolvedPath + importInternal
        };
    }
    return {
        $ref:importInternal
    };
}
const describeTypeLiteral:TsNodeDescriber<ts.TypeLiteralNode | ts.InterfaceDeclaration> = (decl, checker, env) =>{
    const res:Schema<'object'>  = {
        type:'object'
    };
    decl.members.forEach(member=>{
        if(ts.isPropertySignature(member)){
            res.properties = res.properties || {};
            res.properties[member.name.getText()] = decribeVariableDeclaration(member,checker,env)
        }else if(ts.isIndexSignatureDeclaration(member)){
            res.additionalProperties = describeTypeNode(member.type!, checker, env)
        }
        
    });
    return res;
}

const describeArrayType:TsNodeDescriber<ts.ArrayTypeNode> = (decl, checker, env) =>{
    const res:Schema<'array'>  = {
        type:'array',
        items:describeTypeNode(decl.elementType, checker, env)
    };
    
    return res;
}


const describeIntersectionType:TsNodeDescriber<ts.IntersectionTypeNode> = (decl, checker, env) =>{
    const schemas:Schema[] = decl.types.map((t)=>{
        return describeTypeNode(t, checker, env)
    });
 
    const res:Schema = {
        $allOf:schemas
    };
    
    return res;
}



const describeUnionType:TsNodeDescriber<ts.UnionTypeNode> = (decl, checker, env) =>{
    const schemas:Schema[] = decl.types.map((t)=>{
        return describeTypeNode(t, checker, env)
    });
    const groupedSchemas:Schema[] = [];
    let specificString:Schema | undefined;
    let specificNumber:Schema | undefined;
    schemas.forEach(s=>{
        if(s.type==='string' && s.enum){
            specificString = specificString || {
                type:'string',
                enum:[]
            };
            specificString.enum = specificString.enum!.concat(s.enum)  
        }else if(s.type==='number' && s.enum){
            specificNumber = specificNumber || {
                type:'number',
                enum:[]
            };
            specificNumber.enum = specificNumber.enum!.concat(s.enum)  
        }else{
            groupedSchemas.push(s);
        }
    });
    if(specificString){
        groupedSchemas.push(specificString)
    }

    if(specificNumber){
        groupedSchemas.push(specificNumber)
    }

    const res:Schema = {
        $oneOf:groupedSchemas
    };
    
    return res;
}

function isUnionType(t:ts.Type):t is ts.UnionType{
    return !!(t as any).types
}



const supportedPrimitives = ['string','number','boolean']
function serializeType(t:ts.Type, rootNode:ts.Node,checker:ts.TypeChecker):Schema<any>{
    if(t.aliasSymbol){
        return {
            $ref:'#'+t.aliasSymbol.name
        }
    }else if(t.symbol){
        const node = getNode(t.symbol);
        if(ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)){
            return {
                $ref:'#'+t.symbol.name
            }
        }
    }
    const typeString = checker.typeToString(t);
    if(supportedPrimitives.includes(typeString)){
        return {
            type:checker.typeToString(t) as any
        }
    }

    if(isUnionType(t)){
        return {
            $oneOf:t.types.map((tt)=>serializeType(tt, rootNode, checker))
        }
        
    }
    if(typeString==='null'){
        return {
            $ref: NullSchemaId
        }
    }
    if(typeString==='undefined' || typeString === 'void'){
        return {
            $ref: UndefinedSchemaId
        }
    }
    if(typeString==='any'){
        return {
           
        }
    }


    if(typeString.startsWith('"')){
        return {
            type:'string',
            enum:[typeString.slice(1,-1)]
        }
    }
    
    if(!isNaN(parseFloat(typeString))){
        return {
            type:'number',
            enum:[parseFloat(typeString)]
        }
    }

    // currently we support only one call signature
    const signatures = t.getCallSignatures();
    if(signatures.length){
        const signature = signatures[0];
        const res:FunctionSchema = {
            $ref:FunctionSchemaId,
            returns:serializeType(signature.getReturnType(), rootNode, checker),
            arguments:signature.getParameters().map(p=>{
                const t = checker.getTypeOfSymbolAtLocation(p,rootNode);
                return serializeType(t, rootNode, checker)
            })
        }
        return res;
    }

    

    const properties = checker.getPropertiesOfType(t);

    const res:Schema<'object'> = {
        type:'object'
    }

    if(properties.length){
        res.properties = {};
        properties.forEach(prop=>{
            const fieldType = checker.getTypeOfSymbolAtLocation(prop, rootNode);
            res.properties![prop.getName()] = serializeType(fieldType, rootNode,checker);
        })
    }

    const indexType = checker.getIndexTypeOfType(t,ts.IndexKind.String);
    if(indexType){
        res.additionalProperties = serializeType(indexType, rootNode, checker)
    }
    
    return res;
    
}

function hasModifier(node:ts.Node, modifier:number):boolean{
    return !!(node.modifiers && node.modifiers.find((m)=>{
        return m.kind === modifier
    }))
}



