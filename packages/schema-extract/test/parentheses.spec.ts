import {expect} from 'chai';
import { ModuleSchema } from '../src/json-schema-types';
import {transformTest} from '../test-kit/run-transform';

describe('schema-extract - parentheses types', () => {
    it('should support intersection types', async () => {
        const moduleId = 'intersection';
        const res = await transformTest(`
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

        export type Intersection = (A & RGB);
        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                A: {
                    type: 'object',
                    properties: {
                        a: {
                            type: 'string',
                        },
                        b: {
                            type: 'string',
                        },
                        c: {
                            type: 'string',
                        }
                    },
                    required: ['a', 'b', 'c']
                },
                RGB: {
                    type: 'object',
                    properties: {
                        r: {
                            type: 'string',
                        },
                        g: {
                            type: 'string',
                        },
                        b: {
                            type: 'string',
                        }
                    },
                    required: ['r', 'g', 'b']
                },
                Intersection: {
                    $allOf: [
                        {
                            $ref: '#A',
                        },
                        {
                            $ref: '#RGB',
                        },
                    ],
                },
            },
            properties: {

            },
        };
        expect(res).to.eql(expected);
    });

    it('should support union types', async () => {
        const moduleId = 'unions';
        const res = await transformTest(`
        import {AType} from './test-assets'

        export let declared_union : (string | number);

        export let infered_union = Math.random()>0.5 ? 5 : "gaga";

        export let specific_union : Specific_union;

        export let type_union : (AType | number);

        export type Specific_union = ('hello' | 'goodbye' | number);
        export let union_union: (Specific_union | 'goodday');

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
                    initializer: 'Math.random()>0.5 ? 5 : "gaga"'
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
                            required: ['value']
                        },
                    ],
                },
            },
        };
        expect(res).to.eql(expected);
    });

    it('should flatten intersection types inside union', async () => {
        const moduleId = 'union-intersect';
        const res = await transformTest(`
        export type A = number | ( {id: string} & {name: string} );
        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                A: {
                    $oneOf: [
                        {
                            type: 'number',
                        },
                        {
                            $allOf: [{
                                    type: 'object',
                                    properties: {
                                        id: {
                                            type: 'string'
                                        }
                                    },
                                    required: ['id']
                                },
                                {
                                    type: 'object',
                                    properties: {
                                        name: {
                                            type: 'string'
                                        }
                                    },
                                    required: ['name']
                                }
                            ]
                        }
                    ]
                }
            },
            properties: {}
        };
        expect(res).to.eql(expected);
    });
});
