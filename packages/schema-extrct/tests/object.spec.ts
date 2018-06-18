import {expect} from 'chai';
import { ModuleSchema } from '../src/json-schema-types';
import {transformTest} from '../test-kit/run-transform'



describe('schema-extrct - objects',()=>{
    it('should objects with properties', async ()=>{
        const moduleId = 'export-types';
        const res = transformTest(`
        import { AType } from './test-assets';
        
        export let declared_object:{};

        export let declared_object_with_prop:{
            prop:string
        };
        
        export let infered_object = {};
        
        export let infered_object_with_prop = {
            prop:""
        };

        export let declared_with_import:{
            imported:AType
        } 
        `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":'/src/'+moduleId,
            "$ref":"common/module",
            "properties":{
                "declared_object" : {
                    "type":"object"
                },
                "declared_object_with_prop":{
                    "type":"object",
                    "properties":{
                        "prop":{
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
                },
                "declared_with_import":{
                    "type":"object",
                    "properties":{
                        "imported":{
                            "$ref":"/src/test-assets#AType"
                        }   
                    }
                }
            }
        }
        expect(res).to.eql(expected);
    });
    it('should objects with index signature', async ()=>{
        const moduleId = 'index-signatures';
        const res = transformTest(`
        import { AType } from './test-assets';
        
        export let declared_object_with_index:{[key:string]:string};


        export let declared_object_with_index_and_prop:{
            [key:string]:string,
            cnst:string
        };
        

        export let declared_object_with_imported_index:{
            [key:string]:AType
        };
        `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":'/src/'+moduleId,
            "$ref":"common/module",
            "properties":{
                "declared_object_with_index":{
                    "type":"object",
                    "additionalProperties": {
                        "type":"string"
                    }
                },
                "declared_object_with_index_and_prop":{
                    "type":"object",
                    "properties": {
                        "cnst":{
                            "type":"string"
                        }
                    },
                    "additionalProperties": {
                        "type":"string"
                    }
                },
                "declared_object_with_imported_index":{
                    "type":"object",
                    "additionalProperties": {
                        "$ref":"/src/test-assets#AType"
                    }
                }
            }
        }
        expect(res).to.eql(expected);
    });

})

