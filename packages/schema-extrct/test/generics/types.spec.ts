import {expect} from 'chai'
import { ModuleSchema, FunctionSchemaId } from '../../src/json-schema-types'
import {transformTest} from '../../test-kit/run-transform'

describe('schema-extrct - generic types', () => {
    xit('should support genric type definition', async () => {
        const moduleId = 'type-definition'
        const res = transformTest(`
        export type MyType<T> = {
            something:T;
        };
        export let param:MyType<string>;
        `, moduleId)

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                MyType : {
                    type: 'object',
                    genericParams: [{
                        name: 'T',
                    }],
                    properties: {
                        something: {
                            $ref: '#MyType!T',
                        },
                    },
                },
            },
            properties: {
                param: {
                    $ref: '#MyType',
                    genericArguments: [{
                        type: 'string',
                    }],
                },
            },
        }
        expect(res).to.eql(expected)
    })

    xit('should support generic arguments schema', async () => {
        const moduleId = 'type-definition'
        const res = transformTest(`
        export type MyType<T extends string> = {
            something:T;
        };
        export let param:MyType<'gaga'>;
        `, moduleId)

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                MyType : {
                    type: 'object',
                    genericParams: [{
                        name: 'T',
                        type: 'string',
                    }],
                    properties: {
                        something: {
                            $ref: '#MyType!T',
                        },
                    },
                },
            },
            properties: {
                param: {
                    $ref: '#MyType',
                    genericArguments: [{
                        type: 'string',
                        enum: [
                            'gaga',
                        ],
                    }],
                },
            },
        }
        expect(res).to.eql(expected)
    })

    xit('generic arguments should be passed deeply', async () => {
        const moduleId = 'type-definition'
        const res = transformTest(`
        export type MyType<T extends string> = {
            something:{
                deepKey:T
            };
            method:(arg:{
                values:T[],
                filter:(item:T)=>boolean
            })=>{
                status:string,
                results:T[]
            }
        };
        `, moduleId)

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                MyType : {
                    type: 'object',
                    genericParams: [{
                        name: 'T',
                        type: 'string',
                    }],
                    properties: {
                        something: {
                            type: 'object',
                            properties: {
                                deepKey: {
                                    $ref: '#MyType!T',
                                },
                            },
                        },
                        method: {
                            $ref: FunctionSchemaId,
                            arguments: [
                                {
                                    name: 'values',
                                    type: 'array',
                                    items: {
                                        $ref: '#MyType!T',
                                    },
                                }, {
                                    name: 'filter',
                                    $ref: FunctionSchemaId,
                                    arguments: [
                                        {
                                            name: 'item',
                                            $ref: '#MyType!T',
                                        },
                                    ],
                                    returns: {
                                        type: 'boolean',
                                    },
                                },
                            ],
                            returns: {
                                type: 'object',
                                properties: {
                                    status: {
                                        type: 'string',
                                    },
                                    results: {
                                        type: 'array',
                                        items: {
                                            $ref: '#MyType!T',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }
        expect(res).to.eql(expected)
    })
})
