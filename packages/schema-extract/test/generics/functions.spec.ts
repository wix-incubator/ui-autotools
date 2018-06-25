import {expect} from 'chai';
import { ModuleSchema } from '../../src/json-schema-types';
import {transformTest} from '../../test-kit/run-transform';

describe('schema-extract - generic functions', () => {

    xit('should support declared generic functions', async () => {
        const moduleId = 'functions';
        const res = transformTest(`

        export const declaredFunction<T extends string>:(str:T)=>T = (str:T)=>{
            return str
        };


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
                    returns: {
                        $ref: '#declaredFunction!T',
                    },
                },
            },

        };
        expect(res).to.eql(expected);
    });

    xit('should support generic functions with parameter deconstruct', async () => {
        const moduleId = 'functions';
        const res = transformTest(`

        export function declaredDeconstruct<T> ({x:T, y:T}):T { return x };


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
                            name: '{x=1, y="text"}',
                            type: 'object',
                            properties: {
                                x: {
                                    $ref: '#declaredDeconstruct!T',
                                },
                                y: {
                                    $ref: '#declaredDeconstruct!T',
                                },

                            },
                        },
                    ],
                    returns: {
                        $ref: '#declaredDeconstruct!T',
                    },
                },
            },

        };
        expect(res).to.eql(expected);
    });
    xit('should support generic functions with rest params', async () => {
        const moduleId = 'functions';
        const res = transformTest(`
        export let functionWithRestParams<T>:(str:string, ...rest:T[])=>T;
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
                            type: 'string',
                            name: 'str',
                        },
                    ],
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
                },
            },
        };
        expect(res).to.eql(expected);
    });

});
