import * as ts from 'typescript';
import {ModuleSchema, Schema, NullSchemaId, UndefinedSchemaId, FunctionSchemaId, isSchemaOfType, FunctionSchema} from './json-schema-types';
import * as path from 'path';

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
            res.definitions![exportObj.getName()] = describeTypeAlias(node, checker, env)
        }else if(ts.isInterfaceDeclaration(node)){
            res.definitions = res.definitions || {};
            res.definitions![exportObj.getName()] = describeInterface(node, checker, env)
        }else if(ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)){
            res.properties![exportObj.getName()] = describeFunction(node, checker, env, exportObj)
        }
    });
    return res;
}

export type TsSymbolDescriber<S extends Schema> = {
    predicate:(symb:ts.Symbol, decl:ts.Node, checker:ts.TypeChecker )=>boolean;
    describe:(symb:ts.Symbol, decl:ts.Node, checker:ts.TypeChecker, env:Env)=>S;
    name:string;
}

export type TsNodeDescriber<N extends ts.Node, S extends Schema = Schema> = (n:N, checker:ts.TypeChecker, env:Env, symb?:ts.Symbol)=>S


function getNode(symb:ts.Symbol):ts.Node{
    if(!symb.valueDeclaration && symb.declarations!.length!==1){
        throw('unknown declarations')
    }
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





const decribeVariableDeclaration:TsNodeDescriber<ts.VariableDeclaration | ts.PropertySignature | ts.ParameterDeclaration> = (decl, checker, env) =>{
    console.log(decl);
    if(decl.type){
        return describeTypeNode(decl.type!, checker, env);
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
    return describeTypeNode(decl.type,checker,env);
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
    return localRes;
}

const describeFunction:TsNodeDescriber<ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionTypeNode> = (decl, checker, env) =>{
    const returns = decl.type ? describeTypeNode(decl.type, checker, env) : serializeType(checker.getTypeAtLocation(decl),decl , checker).returns!
    const res:FunctionSchema = {
        $ref:FunctionSchemaId,
        arguments : decl.parameters.map(p=>{
            const res = decribeVariableDeclaration(p, checker, env);
            res.name = p.name.getText();
            return res;
        }),
        returns:returns
    }
   
    return res;
}

const describeTypeReference:TsNodeDescriber<ts.TypeReferenceNode> = (decl, checker, env) =>{
    const typeName = decl.typeName;
    if(ts.isQualifiedName(typeName)){
       debugger;
    }
    else{
        const res = describeIdentifier(typeName, checker, env);
        const typeArgs = decl.typeArguments;
        if(typeArgs){
            if(isSchemaOfType('array',res)){
                res.items = describeTypeNode(decl.typeArguments![0], checker, env)
            }
        }
        return res;
    }
    debugger;
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
    if(typeString==='undefined'){
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


