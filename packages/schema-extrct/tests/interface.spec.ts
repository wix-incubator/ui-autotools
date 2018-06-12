import {expect} from 'chai';
import { ModuleSchema } from '../src/json-schema-types';
import {transformTest} from '../test-kit/run-transform'



describe('schema-extrct - interfaces',()=>{
    it('should support typed interfaces', async ()=>{
        const moduleId = '/ui-autotools/arrays';
        const res = transformTest(`
        import { AType } from './test-assets';
        
        export interface MyInterface{
            title:string;
        };
        export let param:MyInterface = {} as any;
        export interface Extendz extends MyInterface {
            desc: string;
        }
        `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":moduleId,
            "$ref":"common/module",
            "definitions":{
                "MyInterface" : {
                    "type":"object",
                    "properties": {
                        "title":{
                            "type":"string"
                        }
                    }
                },
                "Extendz" : {
                    "$allOf": [
                        {
                            $ref:"#MyInterface"
                        },{
                            type:'object',
                            "properties": {
                                "desc":{
                                    "type":"string"
                                }
                            }
                        }
                    ]
                }
            },
            "properties": {
                "param":{
                    "$ref":"#MyInterface"
                }
            }
        }
        expect(res).to.eql(expected);
    });
   
})

