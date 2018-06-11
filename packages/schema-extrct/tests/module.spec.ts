import {expect} from 'chai';
import { ModuleSchema } from '../src/json-schema-types';
import {transformTest} from '../test-kit/run-transform'



describe('schema-extrct - module',()=>{
    it('should support different export types', async ()=>{
        const moduleId = 'export-types';
        const res = transformTest(`
                export let a:string;
                let b:string;
                let c:number;
                export {c};
                
                let z:number;
                
                let d:number = 5;
                export default (d); 
                `, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":moduleId,
            "$ref":"common/module",
            "properties": {
                "a":{
                    "type":"string"
                },
                "c":{
                    "type":"number"
                },
                "default":{
                    "type":"number",
                }
            }
        }
        expect(res).to.eql(expected);
    });

    xit('should support one export mode', async ()=>{
        const moduleId = 'export-one';
        const res = transformTest(`
        let a:string = 'b';
        exports = a; 
        `, moduleId);

        const expected:ModuleSchema<'string'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":moduleId,
            "$ref":"common/module",
            "type":"string",
            "default":"b"
        }
        expect(res).to.eql(expected);
    });

    it('should support imports', async ()=>{
        const moduleId = '/ui-autotools/imports';
        const res = transformTest(`
        import { AType } from './test-assets';
        export let a:AType;
        let b:AType;
        export {b};
        export default b`, moduleId);

        const expected:ModuleSchema<'object'> = {
            "$schema": "http://json-schema.org/draft-06/schema#",
            "$id":moduleId,
            "$ref":"common/module",
            "properties": {
                "a":{
                    "$ref":"/ui-autotools/test-assets#AType"
                },
                "b":{
                    "$ref":"/ui-autotools/test-assets#AType"
                },
                "default":{
                    "$ref":"/ui-autotools/test-assets#AType"
                }
            }
        };

        expect(res).to.eql(expected);
    });
})

