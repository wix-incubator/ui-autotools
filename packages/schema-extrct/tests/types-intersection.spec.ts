import {expect} from 'chai';
import { ModuleSchema } from '../src/json-schema-types';
import {transformTest} from '../test-kit/run-transform'



describe('schema-extrct - intersection',()=>{
    it('should support intersection types', async ()=>{
        const moduleId = '/ui-autotools/intersection';
        const res = transformTest(`
        export type A = {
            a:string;
            b:string;
            c:string;
        } 
        export type RGB = {
            r:string;
            g:string;
            b:string;
        } 
        
        export type Intersection = A & RGB;
        `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":moduleId,
            "$ref":"common/module",
            "definitions": {
                "A":{
                    "type":"object",
                    "properties":{
                        "a":{
                            "type":"string"
                        },
                        "b":{
                            "type":"string"
                        },
                        "c":{
                            "type":"string"
                        }
                    }
                },
                "RGB":{
                    "type":"object",                    
                    "properties":{
                        "r":{
                            "type":"string"
                        },
                        "g":{
                            "type":"string"
                        },
                        "b":{
                            "type":"string"
                        }
                    }
                },
                "Intersection":{
                    "$allOf":[
                        {
                            "$ref":"#A"
                        },
                        {
                            "$ref":"#RGB"
                        }
                    ]
                }
            },
            "properties":{
                
            }
        }
        expect(res).to.eql(expected);
    });
   
})

