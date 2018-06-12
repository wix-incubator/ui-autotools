import {expect} from 'chai';
import { ModuleSchema } from '../src/json-schema-types';
import {transformTest} from '../test-kit/run-transform'

describe('schema-extrct - comments', () => {
    it('should support comments before functions', async ()=>{
        const moduleId = '/ui-autotools/comments';
        const res = transformTest(`
        /**
         * function documentation
         * @param a my parameter documentation
         */
        export function c(a: string) {
            return '' + a;
        }

        `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":"/ui-autotools/comments",
            "$ref":"common/module",
            "properties": {
                "c":{
                    "$ref":"common/function",
                    "description":"function documentation",
                    "arguments":[
                        {
                            "type":"string",
                            "description": "my parameter documentation",
                            "name":"a"
                        }
                    ],
                    "returns":{
                        "type":"string"
                    }
                }
            }
        }
        
        expect(res).to.eql(expected);
    });

    xit('should support comments', async ()=>{
        const moduleId = '/ui-autotools/comments';
        const res = transformTest(`
        /********
         * @minimum 1
         * @maximum 100
         * @stepValue 1
         * ********/
        export let num:number;

        `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":"/ui-autotools/comments",
            "$ref":"common/module",
            "properties": {
                "num":{
                    "type":"number",
                    "minimum":1,
                    "maximum":100,
                    "stepValue":1
                }
            }
        }
        
        expect(res).to.eql(expected);
    })
})