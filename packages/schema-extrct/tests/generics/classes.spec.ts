import {expect} from 'chai';
import { ModuleSchema, ModuleSchemaId, ClassSchemaId, FunctionSchemaId, UndefinedSchemaId, ClassConstructorSchemaId } from '../../src/json-schema-types';
import {transformTest} from '../../test-kit/run-transform'



describe('schema-extrct - generic classes',()=>{
    it('should support generic classes', async ()=>{
        const moduleId = 'classes';
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
            "$id":'/src/'+moduleId,
            "$ref":ModuleSchemaId,
            "definitions":{
                "MyClass" : {
                    "$ref":ClassSchemaId,
                    "constructor":{
                        "$ref":ClassConstructorSchemaId,
                        "arguments":[
                            {
                                "$ref":"#MyClass!T",
                                "name":"x"
                            },{
                                "$ref":"#MyClass!P",
                                "name":"y"
                            }
                        ],
                    },
                    "genericParams": [{
                        "name":"P"
                    },{
                        "name":"T"
                    }],
                    "extends":{
                        "$ref":"/src/test-assets#AGenericClass",
                        "genericArguments":[{
                            "$ref":"#MyClass!P"
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
                    },
                    "staticProperties": {}
                }
            },
            "properties": {
                "MyClass":{
                    "$ref":"#typeof MyClass"
                }
            }
        }
        expect(res).to.eql(expected);
    });

    //Need a better description
    it('should support classes with generic handlers', async ()=>{
        const moduleId = 'classes';
        const res = transformTest(`
        import { Event} from './test-assets'

        export class MyClass{
            constructor(){
                super();
            }
            handleEvent = (e: Event<HTMLElement) => {

            }
        };
        `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":'/src/'+moduleId,
            "$ref":ModuleSchemaId,
            "definitions":{
                "MyClass" : {
                    "$ref":ClassSchemaId,
                    "constructor":{
                        "$ref":ClassConstructorSchemaId,
                        "arguments":[]
                    },
                    "properties": {
                        "handleEvent":{
                            "$ref":FunctionSchemaId,
                            "arguments":[
                                {"$ref":"Event#HTMLElement","name":"event"},
                            ],
                            "returns":{
                                "$ref":UndefinedSchemaId
                            }
                        }
                    },
                    "staticProperties": {}
                }
            },
            "properties": {
                "MyClass":{
                    "$ref":"#typeof MyClass"
                }
            }
        }
        expect(res).to.eql(expected);
    })
})

