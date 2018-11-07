import {expect} from 'chai';
import { ModuleSchema, PromiseId, UndefinedSchemaId } from '../../src/json-schema-types';
import {transformTest} from '../../test-kit/run-transform';

describe('schema-extract - generic functions', () => {

    it('should support declared generic functions', async () => {
        const moduleId = 'functions';
        const functionIntializer = `(str)=>{
            return str
        }`;
        const res = await transformTest(`
        export const declaredFunction: <T extends string>(str:T)=>T = ${functionIntializer};

        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            properties: {
                declaredFunction: {
                    $ref: 'common/function',
                    genericParams: [{
                        name: 'T',
                        type: 'string',
                    }],
                    arguments: [
                        {
                            name: 'str',
                            $ref: '#declaredFunction!T',
                        },
                    ],
                    requiredArguments: ['str'],
                    returns: {
                        $ref: '#declaredFunction!T',
                    },
                    initializer: functionIntializer
                },
            },

        };
        expect(res).to.eql(expected);
    });

    it('should support generic functions with parameter deconstruct', async () => {
        const moduleId = 'functions';
        const res = await transformTest(`

        export function declaredDeconstruct<T> ({x, y}: {x:T,y:T}):T { return x };


        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            properties: {

                declaredDeconstruct: {
                    $ref: 'common/function',
                    genericParams: [{
                        name: 'T',
                    }],
                    arguments: [
                        {
                            name: '{x, y}',
                            type: 'object',
                            properties: {
                                x: {
                                    $ref: '#declaredDeconstruct!T'
                                },
                                y: {
                                    $ref: '#declaredDeconstruct!T',
                                },

                            },
                            required: ['x', 'y'],
                        },
                    ],
                    requiredArguments: ['{x, y}'],
                    returns: {
                        $ref: '#declaredDeconstruct!T'
                    }
                }
            }
        };
        expect(res).to.eql(expected);
    });
    it('should support generic functions with rest params', async () => {
        const moduleId = 'functions';
        const functionIntializer = `(str)=>{
            return str;
        }`;
        const res = await transformTest(`
        export let functionWithRestParams:<T>(str:T, ...rest:T[])=>T = ${functionIntializer};
        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            properties: {
                functionWithRestParams: {
                    $ref: 'common/function',
                    genericParams: [{
                        name: 'T',
                    }],
                    arguments: [
                        {
                            $ref: '#functionWithRestParams!T',
                            name: 'str'
                        }
                    ],
                    requiredArguments: ['str'],
                    restArgument: {
                        name: 'rest',
                        type: 'array',
                        items: {
                            $ref: '#functionWithRestParams!T',
                        },
                    },
                    returns: {
                        $ref: '#functionWithRestParams!T',
                    },
                    initializer: functionIntializer
                },
            },
        };
        expect(res).to.eql(expected);
    });

    xit('should handle functions that return a promise', async () => {
        const moduleId = 'infered_functions';
        const res = await transformTest(`

        export async function asyncFunction(str:string){

        };

        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            properties: {

                asyncFunction: {
                    $ref: 'common/function',
                    arguments: [
                        {
                            type: 'string',
                            name: 'str'
                        }
                    ],
                    returns: {
                        $ref: PromiseId,
                        genericArguments: [
                            {type: UndefinedSchemaId}
                        ]
                    }
                }
            }

        };
        expect(res).to.eql(expected);
    });
});
