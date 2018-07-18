import {expect} from 'chai';
import { ModuleSchema } from '../src/json-schema-types';
import {transformTest} from '../test-kit/run-transform';

describe('schema-extract - primitives', () => {
    it('should support primitives', async () => {
        const moduleId = 'primitives';
        const res = transformTest(`
        export let declared_string: string;
        export let declared_number: number;
        export let declared_boolean: boolean;
        export let declared_null: null;
        export let declared_any: any;
        export let declared_undefined: undefined;
        export let infered_string = "";
        export let infered_number = 0;
        export let infered_boolean = false;
        export let infered_boolean = false;

        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            properties: {
                declared_string : {
                    type: 'string',
                },
                declared_number: {
                    type: 'number',
                },
                declared_boolean: {
                    type: 'boolean',
                },
                declared_null: {
                    $ref: 'common/null',
                },
                declared_any: {
                },
                declared_undefined: {
                    $ref: 'common/undefined',
                },
                infered_string : {
                    type: 'string',
                },
                infered_number: {
                    type: 'number',
                },
                infered_boolean: {
                    type: 'boolean',
                }
            },
            // required:["declared_string","declared_number","infered_string","infered_number","infered_boolean"]
        };
        expect(res).to.eql(expected);
    });

    it('should support exact primitives', async () => {
        const moduleId = 'primitives';
        const res = transformTest(`
        export let specificString: "A";
        export let specificNumber: 5;

        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            properties: {
                specificString : {
                    type: 'string',
                    enum: [
                        'A',
                    ],
                },
                specificNumber: {
                    type: 'number',
                    enum: [
                        5,
                    ],
                },
            },
        };
        expect(res).to.eql(expected);
    });
    
});
