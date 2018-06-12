import {expect} from 'chai';
import { ModuleSchema, ClassConstructorSchemaId, ClassSchemaId } from '../src/json-schema-types';
import {transformTest} from '../test-kit/run-transform'

describe('schema-extrct - comments', () => {
    xit('should support comments before functions', async ()=>{
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

    it('should support comments in classes', async ()=>{
        const moduleId = '/ui-autotools/comments';
        const res = transformTest(`
        /**
         * Documentation for C
         */
            export class C {
            /**
             * constructor documentation
             * @param a my parameter documentation
             * @param b another parameter documentation
             */
            constructor(a: string, b: C) { }
        }

        `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":"/ui-autotools/comments",
            "$ref":"common/module",
            "definitions":{
                "typeof C" : {
                    "$ref":ClassConstructorSchemaId,
                    "description":"constructor documentation",
                    "arguments":[
                        {
                            "type":"string",
                            "name":"a",
                            "description": "my parameter documentation"
                        },
                        {
                            "$ref":"#C",
                            "name":"b",
                            "description":"another parameter documentation"
                        }
                    ],
                    "returns":{
                        $ref:"#C"
                    },
                    "properties":{}
                },
                "C" : {
                    "$ref":ClassSchemaId,
                    "description":"Documentation for C",
                    "constructor":{
                        "$ref":'#typeof C'
                    },
                    "properties": {}
                }
            },
            "properties": {
                "C":{
                    "$ref":"#typeof C"
                }
            }
        }
        debugger;
        expect(res).to.eql(expected);
    })
})