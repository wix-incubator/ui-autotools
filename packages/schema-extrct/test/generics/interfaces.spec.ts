import {expect} from 'chai'
import { ModuleSchema, FunctionSchemaId } from '../../src/json-schema-types'
import {transformTest} from '../../test-kit/run-transform'

describe('schema-extrct - generic interface', () => {
    xit('should support genric interface definition', async () => {
        const moduleId = 'interface-definition'
        const res = transformTest(`
        export type MyInterface<T>{
            something:T;
        };
        export let param:MyInterface<string>;
        `, moduleId)

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                MyInterface : {
                    type: 'object',
                    genericParams: [{
                        name: 'T'
                    }],
                    properties: {
                        something: {
                            $ref: '#MyInterface!T'
                        }
                    }
                }
            },
            properties: {
                param: {
                    $ref: '#MyInterface',
                    genericArguments: [{
                        type: 'string'
                    }]
                }
            }
        }
        expect(res).to.eql(expected)
    })

    xit('should support generic arguments schema', async () => {
        const moduleId = 'interface-definition'
        const res = transformTest(`
        export type MyInterface<T extends string>{
            something:T;
        };
        export let param:MyInterface<'gaga'>;
        `, moduleId)

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                MyInterface : {
                    type: 'object',
                    genericParams: [{
                        name: 'T',
                        type: 'string'
                    }],
                    properties: {
                        something: {
                            $ref: '#MyInterface!T'
                        }
                    }
                }
            },
            properties: {
                param: {
                    $ref: '#MyInterface',
                    genericArguments: [{
                        type: 'string',
                        enum: [
                            'gaga'
                        ]
                    }]
                }
            }
        }
        expect(res).to.eql(expected)
    })

    xit('generic arguments should be passed deeply', async () => {
        const moduleId = 'interface-definition'
        const res = transformTest(`
        export type MyInterface<T extends string>{
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
                MyInterface : {
                    type: 'object',
                    genericParams: [{
                        name: 'T',
                        type: 'string'
                    }],
                    properties: {
                        something: {
                            type: 'object',
                            properties: {
                                deepKey: {
                                    $ref: '#MyInterface!T'
                                }
                            }
                        },
                        method: {
                            $ref: FunctionSchemaId,
                            arguments: [
                                {
                                    name: 'values',
                                    type: 'array',
                                    items: {
                                        $ref: '#MyInterface!T'
                                    }
                                }, {
                                    name: 'filter',
                                    $ref: FunctionSchemaId,
                                    arguments: [
                                        {
                                            name: 'item',
                                            $ref: '#MyInterface!T'
                                        }
                                    ],
                                    returns: {
                                        type: 'boolean'
                                    }
                                }
                            ],
                            returns: {
                                type: 'object',
                                properties: {
                                    status: {
                                        type: 'string'
                                    },
                                    results: {
                                        type: 'array',
                                        items: {
                                            $ref: '#MyInterface!T'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        expect(res).to.eql(expected)
    })
})
