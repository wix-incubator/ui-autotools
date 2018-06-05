import * as ts from 'typescript';
import * as path from 'path';
import  * as json_schema_types from './json-schema-types';
import {ModuleSchema, Schema, SchemaTypes, PrimitiveTypes, NullSchemaId, UndefinedSchemaId} from './json-schema-types';


export function transform(checker: ts.TypeChecker, sourceFile:ts.SourceFile){
    const moduleSymbol = (sourceFile as any).symbol
    const exports = checker.getExportsOfModule(moduleSymbol);
    const projectRoot = path.join(__dirname,'../');
    const moduleId = 'ui-autotools/'+sourceFile.fileName.slice(projectRoot.length, -path.extname(sourceFile.fileName).length);
    const res: ModuleSchema = {
        '$schema':'http://json-schema.org/draft-06/schema#',
        '$id':moduleId,
        '$ref':'common/module',
        'properties':{}
    };
    exports.forEach((exportObj) => {
        const declaration = exportObj.valueDeclaration || exportObj.declarations![0]
        const innerType = checker.getTypeAtLocation(declaration!);
        res.properties[exportObj.getName()] = transformExport(declaration, innerType, checker)
    });
    return res;
}

export type TsNodeDescriber<S extends Schema> = {
    predicate:(decl:ts.Declaration, typ:ts.Type, typeName:string )=>boolean;
    describe:(decl:ts.Declaration, typ:ts.Type, typeName:string, checker:ts.TypeChecker)=>S
}

const exportTransformers:TsNodeDescriber<Schema>[] = [];


function transformExport(decl:ts.Declaration, declType:ts.Type, checker:ts.TypeChecker):Schema<SchemaTypes>{
    const typeName = checker.typeToString(declType);

    const transformer = exportTransformers.find((transformer)=>
        transformer.predicate(decl,declType,typeName)
    );
    if(!transformer){
        return {}
    }
    return transformer.describe(decl,declType,typeName,checker)
}

const stringDescriber:TsNodeDescriber<Schema> = {
    predicate:(decl, declType, typeName)=>{
        return typeName==='string';
    },
    describe:(decl, declType, typeName, checker)=>{
        return {
            type: "string"
        }
    }
}
exportTransformers.push(stringDescriber);


const specificStringDescriber:TsNodeDescriber<Schema> = {
    predicate:(decl, declType, typeName)=>{
        return typeName.startsWith('"') && typeName.endsWith('"');
    },
    describe:(decl, declType, typeName, checker)=>{
        return {
            type: "string",
            enum:[typeName.slice(1,-1)]
        }
    }
}
exportTransformers.push(specificStringDescriber);



const numberDescriber:TsNodeDescriber<Schema> = {
    predicate:(decl, declType, typeName)=>{
        debugger;
        return typeName==='number';
    },
    describe:(decl, declType, typeName, checker)=>{
        return {
            type: "number"
        }
    }
}
exportTransformers.push(numberDescriber);

const specificNumberDescriber:TsNodeDescriber<Schema> = {
    predicate:(decl, declType, typeName)=>{
        return !isNaN(parseFloat(typeName));
    },
    describe:(decl, declType, typeName, checker)=>{
        return {
            type: "number",
            enum:[parseFloat(typeName)]
        }
    }
}
exportTransformers.push(specificNumberDescriber);


const booleanDescriber:TsNodeDescriber<Schema> = {
    predicate:(decl, declType, typeName)=>{
        return typeName==='boolean';
    },
    describe:(decl, declType, typeName, checker)=>{
        return {
            type: "boolean"
        }
    }
}
exportTransformers.push(booleanDescriber);


const nullDescriber:TsNodeDescriber<Schema> = {
    predicate:(decl, declType, typeName)=>{
        return typeName==='null';
    },
    describe:(decl, declType, typeName, checker)=>{
        return {
            $ref: NullSchemaId
        }
    }
}
exportTransformers.push(nullDescriber);

const undefinedDescriber:TsNodeDescriber<Schema> = {
    predicate:(decl, declType, typeName)=>{
        return typeName==='undefined';
    },
    describe:(decl, declType, typeName, checker)=>{
        return {
            $ref: UndefinedSchemaId
        }
    }
}
exportTransformers.push(undefinedDescriber);