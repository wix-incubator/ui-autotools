import {expect} from 'chai';
import { ModuleSchema } from '../src/json-schema-types';
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
    
    xit('should support functions with parameter deconstruct', async ()=>{
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
                            "type":"object",
                            "properties":{
                                "x":{
                                    "type":"number",
                                    "default":1
                                },
                                "y":{
                                    "type":"string",
                                    "default":"text"
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
    
        
})

