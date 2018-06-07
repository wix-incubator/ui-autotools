import {expect} from 'chai';
import { ModuleSchema } from '../src/json-schema-types';
import {transformTest} from '../test-kit/run-transform'



describe('schema-extrct - objects',()=>{
    it('should objects with properties', async ()=>{
        const moduleId = 'export-types';
        const res = transformTest(`
        export let declared_object:{};

        export let declared_object_with_prop:{
            props:string
        };
        
        export let infered_object = {};
        
        export let infered_object_with_prop = {
            prop:""
        };
        `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":moduleId,
            "$ref":"common/module",
            "properties":{
                "declared_object" : {
                    "type":"object"
                },
                "declared_object_with_prop":{
                    "type":"object",
                    "properties":{
                        "props":{
                            "type":"string"
                        }   
                    }
                },
                "infered_object":{
                    "type":"object"
                },
                "infered_object_with_prop":{
                    "type":"object",
                    "properties":{
                        "prop":{
                            "type":"string"
                        }   
                    }
                }
            }
        }
        expect(res).to.eql(expected);
    });

})

