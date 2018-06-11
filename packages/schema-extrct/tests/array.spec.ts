import {expect} from 'chai';
import { ModuleSchema } from '../src/json-schema-types';
import {transformTest} from '../test-kit/run-transform'



describe('schema-extrct - arrays',()=>{
    it('should support types arrays', async ()=>{
        const moduleId = '/ui-autotools/arrays';
        const res = transformTest(`
        import { AType } from './test-assets';
        
        export let declared_array:string[];
        export let import_array:Array<AType>;

        `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":moduleId,
            "$ref":"common/module",
            "properties":{
                "declared_array" : {
                    "type":"array",
                    "items": {
                        "type":"string"
                    }
                }
                ,"import_array" : {
                    "type":"array",
                    "items": {
                        "$ref":"/ui-autotools/test-assets#AType"
                    }
                }
            }
        }
        expect(res).to.eql(expected);
    });
   
})

