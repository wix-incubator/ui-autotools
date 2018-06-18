import {expect} from 'chai';
import { ModuleSchema, ModuleSchemaId, ClassConstructorSchemaId, ClassSchemaId, FunctionSchemaId, UndefinedSchemaId } from '../../src/json-schema-types';
import {transformTest} from '../../test-kit/run-transform'



describe('schema-extrct - generic classes',()=>{
    it('should support generic classes', async ()=>{
        const moduleId = '/ui-autotools/classes';
        const res = transformTest(`
        import { AGenericClass} from './test-assets'

        export class MyClass<P, T> extends AGenericClass<P>{
            a:P;
            b:T;
            constructor(x:T, y:P){
                super();
            }
            setA(newA:T,prefix:P):void{

            }
        };
        `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":"/ui-autotools/classes",
            "$ref":ModuleSchemaId,
            "definitions":{
                "typeof MyClass" : {
                    "$ref":ClassConstructorSchemaId,
                    "genericParams": [{
                        "name":"P"
                    },{
                        "name":"T"
                    }],
                    "arguments":[
                        {
                            "$ref":"#typeof MyClass!T",
                            "name":"x"
                        },{
                            "$ref":"#typeof MyClass!P",
                            "name":"y"
                        }
                    ],
                    "returns":{
                        "$ref":"#MyClass",
                        "genericArguments":[{
                            "$ref":"#typeof MyClass!P"
                        },{
                            "$ref":"#typeof MyClass!T"
                        }]
                    },
                    "extends":{
                        "$ref":"/ui-autotools/test-assets#typeof AGenericClass",
                        "genericArguments":[{
                            "$ref":"#typeof MyClass!P"
                        }]
                    },
                    "properties": {}
                },
                "MyClass" : {
                    "$ref":ClassSchemaId,
                    "constructor":{
                        "$ref":'#typeof MyClass'
                    },
                    "genericParams": [{
                        "name":"P"
                    },{
                        "name":"T"
                    }],
                    "extends":{
                        "$ref":"/ui-autotools/test-assets#AGenericClass",
                        "genericArguments":[{
                            "$ref":"#typeof MyClass!P"
                        }]
                    },
                    "properties": {
                        "a":{
                            "$ref":"#MyClass!P"
                        },
                        "b":{
                            "$ref":"#MyClass!T"
                        },
                        "setA":{
                            "$ref":FunctionSchemaId,
                            "arguments":[
                                {"$ref":"#MyClass!T","name":"newA"},
                                {"$ref":"#MyClass!P","name":"prefix"}
                            ],
                            "returns":{
                                "$ref":UndefinedSchemaId
                            }
                        }
                    }
                }
            },
            "properties": {
                "MyClass":{
                    "$ref":"#typeof MyClass"
                }
            }
        }
        debugger;
        expect(res).to.eql(expected);
    })
  
    
        
})

