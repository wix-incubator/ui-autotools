import {expect} from 'chai';
import { ModuleSchema } from '../src/json-schema-types';
import {transformTest} from '../test-kit/run-transform';

describe('schema-extrct - union', () => {
    it('should support union types', async () => {
        const moduleId = 'unions';
        const res = transformTest(`
        import {AType} from './test-assets'

        export let declared_union : string | number;

        export let infered_union = Math.random()>0.5 ? 5 : "gaga";

        export let specific_union : Specific_union;

        export let type_union : AType | number;

        export type Specific_union = 'hello' | 'goodbye' | number;
        export let union_union: Specific_union | 'goodday';

        export let inline_union: number | {
            value:number
        }
        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                Specific_union: {
                    $oneOf: [
                        {
                            type: 'number',
                        },
                        {
                            type: 'string',
                            enum: ['hello', 'goodbye'],
                        },
                    ],
                },
            },
            properties: {
                declared_union: {
                    $oneOf: [
                        {
                            type: 'string',
                        },
                        {
                            type: 'number',
                        },
                    ],
                },
                infered_union: {
                    $oneOf: [
                        {
                            type: 'string',
                        },
                        {
                            type: 'number',
                        },
                    ],
                },
                specific_union: {
                    $ref: '#Specific_union',
                },
                type_union: {
                    $oneOf: [
                        {
                            $ref: '/src/test-assets#AType',
                        },
                        {
                            type: 'number',
                        },
                    ],

                },
                union_union: {
                    $oneOf: [
                        {
                            $ref: '#Specific_union',
                        },
                        {
                            type: 'string',
                            enum: ['goodday'],
                        },
                    ],
                },
                inline_union: {
                    $oneOf: [
                        {
                            type: 'number',
                        },
                        {
                            type: 'object',
                            properties: {
                                value: {
                                    type: 'number',
                                },
                            },
                        },
                    ],
                },
            },
        };
        expect(res).to.eql(expected);
    });

});
