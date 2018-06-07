import * as ts from 'typescript';
import {ModuleSchema, Schema, SchemaTypes , NullSchemaId, UndefinedSchemaId} from './json-schema-types';
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
    debugger;
    const res: ModuleSchema = {
        '$schema':'http://json-schema.org/draft-06/schema#',
        '$id':moduleId,
        '$ref':'common/module',
        'properties':{}
    };
    ts.isAccessor;

    exports.forEach((exportObj) => {
        let significantNode: ts.Node;
        if(exportObj.valueDeclaration){
            significantNode = exportObj.valueDeclaration!;
        }    
        else{
            const declarations = exportObj.getDeclarations() || [];
            if(declarations.length===1){
                significantNode = declarations[0];
            }else{
                throw new Error('?????')
            }
        }

       
        const schema = resolveNode(significantNode, checker, env);
        res.properties![exportObj.getName()] = schema;
    });
    return res;
}

export type TsNodeDescriber<S extends Schema> = {
    predicate:(decl:ts.Node, checker:ts.TypeChecker )=>boolean;
    describe:(decl:ts.Node, checker:ts.TypeChecker, env:Env)=>S;
    name:string;
}
export type TsTypeDescriber<S extends Schema> = {
    predicate:(decl:ts.Type, checker:ts.TypeChecker )=>boolean;
    describe:(decl:ts.Type, checker:ts.TypeChecker, env:Env)=>S;
    name:string;
}

const exportTransformers:TsNodeDescriber<Schema>[] = [];
const typeTransformers:TsTypeDescriber<Schema>[] = [];


function resolveNode(node:ts.Node, checker:ts.TypeChecker, env:Env):Schema<SchemaTypes>{


    const transformer = exportTransformers.find((transformer)=>
        transformer.predicate(node,checker)
    );
    if(!transformer){
        debugger;
        return {}
    }
    return transformer.describe(node,checker,env)
}

/******************************* */

// exports

/******************************* */


const variableDeclarationDescriber:TsNodeDescriber<Schema> = {
    name:'variableDeclarationDescriber',
    predicate:(decl,checker)=>{
        return ts.isVariableDeclaration(decl) || ts.isPropertySignature(decl);
    },
    describe:(decl, checker, env)=>{
        const typedDecl = decl as ts.VariableDeclaration;
        console.log(typedDecl);
        let declType:ts.Type;
        if(typedDecl.type){
            const typeNode = typedDecl.type;
            if(ts.isTypeReferenceNode(typeNode)){
                const referencedSymb = checker.getSymbolAtLocation(typeNode.typeName);
                const referencedSymbDecl = referencedSymb!.declarations![0];
                let importPath:string | undefined = undefined;
                let importInternal:string | undefined = undefined;
                if(ts.isNamespaceImport(referencedSymbDecl)){
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
                }

                if(importPath){
                    const currentDir = posix.dirname(env.moduleId);
                    const resolvedPath = posix.resolve(currentDir ,importPath);
                    
                    return {
                        $ref:resolvedPath + importInternal
                    };
                }
            }
            // checker.getSymbolAtLocation(typedDecl.type!.typeName)
            // typedDecl.type!.
            declType = checker.getTypeAtLocation(typedDecl.type);
            // const symbol = typedDecl.type
        }else{
            declType = checker.getTypeAtLocation(decl);
        }
      
        return serializeType(declType, checker)
    }
}
exportTransformers.push(variableDeclarationDescriber);


const exportSpecifierDescriber:TsNodeDescriber<Schema> = {
    name:'exportSpecifierDescriber',
    predicate:(decl, cheker)=>{
        return ts.isExportSpecifier(decl);
    },
    describe:(decl, checker, env)=>{
        let declType:ts.Type;
        declType = checker.getTypeAtLocation(decl);
      
        return serializeType(declType, checker);
    }
}
exportTransformers.push(exportSpecifierDescriber);


const exportAssignmentDescriber:TsNodeDescriber<Schema> = {
    name:'exportAssignmentDescriber',
    predicate:(decl,checker)=>{
        return ts.isExportAssignment(decl);
    },
    describe:(decl, checker, env)=>{
        const exportDecl = decl as ts.ExportAssignment;
        let declSymb = checker.getSymbolAtLocation(exportDecl.expression);
        if(declSymb){
            return resolveNode(declSymb.declarations![0], checker, env)
        }
        let declType:ts.Type;
        declType = checker.getTypeAtLocation(exportDecl.expression);
      
        // const res = resolveNode(exportDecl.expression,checker, env);
        return serializeType(declType, checker);
    }
}
exportTransformers.push(exportAssignmentDescriber);



/******************************* */

// end exports

/******************************* */

console.log(typeTransformers)
const supportedPrimitives = ['string','number','boolean']
function serializeType(t:ts.Type,checker:ts.TypeChecker):Schema<any>{
    const typeString = checker.typeToString(t);
    if(supportedPrimitives.includes(typeString)){
        return {
            type:checker.typeToString(t) as any
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

    const properties = checker.getPropertiesOfType(t);

    if(properties.length===0){
        return {
            type:'object'
        }
    }

    const res:Schema = {
        type:'object',
        properties:{}
    }

    properties.forEach(prop=>{
        const fieldType = checker.getTypeOfSymbolAtLocation(prop,prop.declarations![0]);        
        res.properties![prop.getName()] = serializeType(fieldType,checker);
    })
    return res;
    
}


/****************
 * assignments
 */


// const expressionDescriber:TsNodeDescriber<Schema> = {
//     name:'expressionDescriber',
//     predicate:(decl, checker)=>{
//         return ts.SyntaxKind.ParenthesizedExpression === decl.kind;
//     },
//     describe:(decl, checker, env)=>{
//         const typeNode = checker.typeToTypeNode(checker.getTypeAtLocation(decl));
//         const res = resolveNode(typeNode, checker, env);
//         return res;
//     }
// }
// exportTransformers.push(expressionDescriber);



// const identifierDescriber:TsNodeDescriber<Schema> = {
//     name:'identifierDescriber',
//     predicate:(decl, checker)=>{
//         return ts.isIdentifier(decl);
//     },
//     describe:(decl, checker, env)=>{
//         const typedDecl = decl as ts.Identifier;
//         const symb  = checker.getSymbolAtLocation(typedDecl)!;
//         const definition = symb.getDeclarations()![0];
//         let importPath:string | undefined = undefined;
//         let importInternal:string | undefined = undefined;
//         if(ts.isNamespaceImport(definition)){
//             const target = definition.parent!.parent!.moduleSpecifier.getText().slice(1,-1);
//             importPath = target;
//             importInternal = '';
//         }else if(ts.isImportSpecifier(definition)){
//             const target = definition.parent!.parent!.parent!.moduleSpecifier.getText().slice(1,-1);
//             importPath = target;
//             importInternal = '#'+definition.getText();
//         }else if(ts.isImportClause(definition)){
//             const target = definition.parent!.moduleSpecifier.getText().slice(1,-1);
//             importPath = target;
//             importInternal = '#default';
//         }else{
//             const typeNode = checker.typeToTypeNode(checker.getTypeAtLocation(definition));
//             const res = resolveNode(typeNode, checker, env);
//             return res;
//         }
        
        
//         if(importPath){
//             const currentDir = posix.dirname(env.moduleId);
//             const resolvedPath = posix.resolve(currentDir ,importPath);
            
//             return {
//                 $ref:resolvedPath + importInternal
//             };
//         }
//         return {};
//     }
// }
// exportTransformers.push(identifierDescriber);

// const typeReferencetDescriber:TsNodeDescriber<Schema> = {
//     name:'typeReferencetDescriber',
//     predicate:(decl, checker)=>{
//         return ts.isTypeReferenceNode(decl);
//     },
//     describe:(decl, checker, env)=>{
//         // debugger;
//         const typedNode = decl as ts.TypeReferenceNode;
//         typedNode.typeName
//         return resolveNode(typedNode.typeName,checker,env);
//     }
// }
// exportTransformers.push(typeReferencetDescriber);



// /****************
//  * Primitives
//  */

// const anyDescriber:TsNodeDescriber<Schema> = {
//     name:'anyDescriber',
//     predicate:(decl,checker)=>{
//         return ts.SyntaxKind.AnyKeyword === decl.kind;
//     },
//     describe:(decl, checker)=>{
//         return {
//         }
//     }
// }
// exportTransformers.push(anyDescriber);



// const stringDescriber:TsNodeDescriber<Schema> = {
//     name:'stringDescriber',
//     predicate:(decl, checker)=>{
//         return ts.SyntaxKind.StringKeyword === decl.kind;
//     },
//     describe:(decl, checker)=>{
//         return {
//             type: "string"
//         }
//     }
// }
// exportTransformers.push(stringDescriber);


// const exactStringDescriber:TsNodeDescriber<Schema> = {
//     name:'exactStringDescriber',
//     predicate:(decl, checker)=>{
//         if(ts.isLiteralTypeNode(decl)){
//             return decl.literal.getText().charAt(0)==='"';
//         }
//        return false
//     },
//     describe:(decl, checker)=>{
//         const declType = checker.getTypeAtLocation(decl);
//         const typeName = checker.typeToString(declType);
//         return {
//             type: "string",
//             enum:[typeName.slice(1,-1)]
//         }
//     }
// }
// exportTransformers.push(exactStringDescriber);



// const numberDescriber:TsNodeDescriber<Schema> = {
//     name:'numberDescriber',
//     predicate:(decl, checker)=>{
//         return ts.SyntaxKind.NumberKeyword === decl.kind;
//     },
//     describe:(decl, checker)=>{
//         return {
//             type: "number"
//         }
//     }
// }
// exportTransformers.push(numberDescriber);

// const exactNumberDescriber:TsNodeDescriber<Schema> = {
//     name:'exactNumberDescriber',
//     predicate:(decl, checker)=>{
//         if(ts.isLiteralTypeNode(decl)){
//             return !isNaN(parseFloat(decl.literal.getText()));
//         }
//        return false
//     },
//     describe:(decl, checker)=>{
//         const declType = checker.getTypeAtLocation(decl);
//         const typeName = checker.typeToString(declType);
//         debugger;
//         return {
//             type: "number",
//             enum:[parseFloat(typeName)]
//         }
//     }
// }
// exportTransformers.push(exactNumberDescriber);


// const booleanDescriber:TsNodeDescriber<Schema> = {
//     name:'booleanDescriber',
//     predicate:(decl, checker)=>{
//         return ts.SyntaxKind.BooleanKeyword === decl.kind;
//     },
//     describe:(decl, checker)=>{
//         return {
//             type: "boolean"
//         }
//     }
// }
// exportTransformers.push(booleanDescriber);


// const nullDescriber:TsNodeDescriber<Schema> = {
//     name:'nullDescriber',
//     predicate:(decl, checker)=>{
//         return ts.SyntaxKind.NullKeyword === decl.kind;
//     },
//     describe:(decl, checker)=>{
//         return {
//             $ref: NullSchemaId
//         }
//     }
// }
// exportTransformers.push(nullDescriber);

// const undefinedDescriber:TsNodeDescriber<Schema> = {
//     name:'undefinedDescriber',
//     predicate:(decl, checker)=>{
//         return ts.SyntaxKind.UndefinedKeyword === decl.kind;
//     },
//     describe:(decl, checker)=>{
//         return {
//             $ref: UndefinedSchemaId
//         }
//     }
// }
// exportTransformers.push(undefinedDescriber);



// /****************
//  * objects
//  */

// const typeLiteralDescriber:TsNodeDescriber<Schema> = {
//     name:'typeLiteralDescriber',
//     predicate:(decl, checker)=>{
//         return ts.isTypeLiteralNode(decl);
//     },
//     describe:(decl, checker, env)=>{
//         const typedDecl = decl as ts.LiteralTypeNode; 
//         const res:Schema<'object'> = {
//             type:"object"
            
//         } 

//         const properties = checker.getPropertiesOfType(checker.getTypeAtLocation(decl));
//         if(properties.length){
//             res.properties = {},
//             properties.forEach(property=>{
//                 res.properties![property.name] = resolveNode(property.valueDeclaration!,checker,env)
//             })
//         }
        
//         return res
//     }
// }
// exportTransformers.push(typeLiteralDescriber);