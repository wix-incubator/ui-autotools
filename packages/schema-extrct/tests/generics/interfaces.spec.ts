import {expect} from 'chai';
import { ModuleSchema, FunctionSchemaId } from '../../src/json-schema-types';
import {transformTest} from '../../test-kit/run-transform'



describe('schema-extrct - generic interface',()=>{
    it('should support genric interface definition', async ()=>{
        const moduleId = '/ui-autotools/interface-definition';
        const res = transformTest(`
        export type MyInterface<T>{
            something:T;
        };
        export let param:MyInterface<string>;
        `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":moduleId,
            "$ref":"common/module",
            "definitions":{
                "MyInterface" : {
                    "type":"object",
                    "genericParams": [{
                        name:"T"
                    }],
                    "properties": {
                        "something":{
                            "$ref":"#MyInterface!T"
                        } 
                    }
                }
            },
            "properties": {
                "param":{
                    "$ref":"#MyInterface",
                    "genericArguments":[{
                        "type":"string"
                    }]
                }
            }
        }
        expect(res).to.eql(expected);
    });

    it('should support generic arguments schema', async ()=>{
        const moduleId = '/ui-autotools/interface-definition';
        const res = transformTest(`
        export type MyInterface<T extends string>{
            something:T;
        };
        export let param:MyInterface<'gaga'>;
        `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":moduleId,
            "$ref":"common/module",
            "definitions":{
                "MyInterface" : {
                    "type":"object",
                    "genericParams": [{
                        name:"T",
                        "type":"string"
                    }],
                    "properties": {
                        "something":{
                            "$ref":"#MyInterface!T"
                        } 
                    }
                }
            },
            "properties": {
                "param":{
                    "$ref":"#MyInterface",
                    "genericArguments":[{
                        "type":"string",
                        "enum":[
                            "gaga"
                        ]
                    }]
                }
            }
        }
        expect(res).to.eql(expected);
    });


    it('generic arguments should be passed deeply', async ()=>{
        const moduleId = '/ui-autotools/interface-definition';
        const res = transformTest(`
        export type MyInterface<T extends string>{
            something:{
                deepKey:T
            };
            method:(arg:{
                values:T[],
                filter:(item:T)=>boolean
            })=>{
                status:string,
                results:T[]
            }
        };
        `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":moduleId,
            "$ref":"common/module",
            "definitions":{
                "MyInterface" : {
                    "type":"object",
                    "genericParams": [{
                        "name":"T",
                        "type":"string"
                    }],
                    "properties": {
                        "something":{
                            "type":"object",
                            "properties":{
                                "deepKey":{
                                    "$ref":"#MyInterface!T"
                                }
                            }
                        },
                        "method":{
                            "$ref":FunctionSchemaId,
                            "arguments":[
                                {
                                    "name":"arg",
                                    "type":"object",
                                    "properties": {
                                        "values": {
                                            "type":"array",
                                            "items":{
                                                "$ref":"#MyInterface!T"
                                            }
                                        },
                                        "filter": {
                                            "$ref":FunctionSchemaId,
                                            "arguments":[
                                                {
                                                    "name":"item",
                                                    "$ref":"#MyInterface!T"
                                                }
                                            ],
                                            "returns":{
                                                "type":"boolean"
                                            }
                                        }
                                    }
                                }
                            ],
                            "returns":{
                                "type":"object",
                                "properties":{
                                    "status":{
                                        "type":"string"
                                    },
                                    "results":{  
                                        "type":"array",
                                        "items":{
                                            "$ref":"#MyInterface!T"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            properties: {}
        }
        expect(res).to.eql(expected);
    });
})

