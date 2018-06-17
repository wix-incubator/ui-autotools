import {expect} from 'chai';
import { ModuleSchema, UndefinedSchemaId, FunctionSchemaId, ModuleSchemaId } from '../src/json-schema-types';
import {transformTest} from '../test-kit/run-transform'



describe('schema-extrct - functions',()=>{
    it('should support infered function return values', async ()=>{
        const moduleId = '/ui-autotools/infered_functions';
        const res = transformTest(`
        export function inferedFunction(str:string){
            return str+'a'
        };

        `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":moduleId,
            "$ref":"common/module",
            "properties": {
                "inferedFunction":{
                    "$ref":"common/function",
                    "arguments":[
                        {
                            "type":"string",
                            "name":"str"
                        }
                    ],
                    "returns":{
                        "type":"string"
                    }
                }
            }
            
        }
        expect(res).to.eql(expected);
    })
    it('should support declared functions return values', async ()=>{
        const moduleId = '/ui-autotools/functions';
        const res = transformTest(`
      
        export const declaredFunction:(str:string)=>string = (str:string)=>{
            return str+'a'
        };
      

        `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":moduleId,
            "$ref":"common/module",
            "properties": {
                
                "declaredFunction":{
                    "$ref":"common/function",
                    "arguments":[
                        {
                            "type":"string",
                            "name":"str"
                        }
                    ],
                    "returns":{
                        "type":"string"
                    }
                }
            }
            
        }
        expect(res).to.eql(expected);
    })
    
    it('should support functions with parameter deconstruct', async ()=>{
        const moduleId = '/ui-autotools/functions';
        const res = transformTest(`
        
        export function inferedDeconstruct ({x=1, y="text"}) { return x + y; };


        `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":moduleId,
            "$ref":"common/module",
            "properties": {
                
                "inferedDeconstruct":{
                    "$ref":"common/function",
                    "arguments":[
                        {
                            "name":"{x=1, y=\"text\"}",
                            "type":"object",
                            "properties":{
                                "x":{
                                    "type":"number"
                                },
                                "y":{
                                    "type":"string"
                                }
        
                            }
                        }
                    ],
                    "returns":{
                        "type":"string"
                    }
                }
            }
            
        }
        expect(res).to.eql(expected);
    })
    it('should support functions with rest params', async ()=>{
        const moduleId = '/ui-autotools/functions';
        const res = transformTest(`
        export const functionWithRestParams:(str:string, ...rest:number[])=>string = (str:string)=>{
            return str+'a'
        };

        `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":moduleId,
            "$ref":"common/module",
            "properties": {
                "functionWithRestParams":{
                    "$ref":"common/function",
                    "arguments":[
                        {
                            "type":"string",
                            "name":"str"
                        }
                    ],
                    "restArgument":{
                        "name":"rest",
                        "type":"array",
                        "items":{
                            type:'number'
                        }
                    },
                    "returns":{
                        "type":"string"
                    }
                }
            }
        }
        expect(res).to.eql(expected);
    })
    

    it('should support infered void functions', async ()=>{
        const moduleId = '/ui-autotools/functions';
        const res = transformTest(`
        export function voidFunc(str:string){
            console.log(str);
        };

        `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":moduleId,
            "$ref":ModuleSchemaId,
            "properties": {
                "voidFunc":{
                    "$ref":FunctionSchemaId,
                    "arguments":[
                        {
                            "type":"string",
                            "name":"str"
                        }
                    ],
                    "returns":{
                        $ref:UndefinedSchemaId
                    }
                }
            }
        }
        expect(res).to.eql(expected);
    })
      
    it('should support declared void functions', async ()=>{
        const moduleId = '/ui-autotools/functions';
        const res = transformTest(`
        export function voidFunc(str:string):void{
            console.log(str);
        };

        `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":moduleId,
            "$ref":ModuleSchemaId,
            "properties": {
                "voidFunc":{
                    "$ref":FunctionSchemaId,
                    "arguments":[
                        {
                            "type":"string",
                            "name":"str"
                        }
                    ],
                    "returns":{
                        $ref:UndefinedSchemaId
                    }
                }
            }
        }
        expect(res).to.eql(expected);
    })


    it('should support infered function return type (with import)', async ()=>{
        const moduleId = '/ui-autotools/infered_functions';
        const res = transformTest(`
        import {AType} from './test-assets
        export function inferedFunction(str:string){
            const res:AType = 'gaga'
            return res;
        };

        `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":moduleId,
            "$ref":"common/module",
            "properties": {
               
                "inferedFunction":{
                    "$ref":"common/function",
                    "arguments":[
                        {
                            "type":"string",
                            "name":"str"
                        }
                    ],
                    "returns":{
                        "type":"string"                    }
                }
            }
            
        }
        expect(res).to.eql(expected);
    })
})

