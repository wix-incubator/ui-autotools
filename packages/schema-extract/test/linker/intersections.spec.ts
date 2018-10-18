import {expect} from 'chai';
import { Schema } from '../../src/json-schema-types';
import {linkTest} from '../../test-kit/run-linker';

describe('schema-linker - intersections', () => {
    it('should flatten intersection types', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export type A = {
            something:number;
        };
        export type B = {
            somethingElse:string;
        };
        export type C = A &  B
        `}, 'C', fileName);

        const expected: Schema<'object'> = {
            type: 'object',
            properties: {
                something: {
                    definedAt: '#A',
                    type: 'number'
                },
                somethingElse: {
                    definedAt: '#B',
                    type: 'string'
                }
            },
            required: ['something', 'somethingElse']
        };
        expect(res).to.eql(expected);
    });

    it('should properly handle an intersection between a type and interface', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export interface A {
            something:string
        }

        export type B = {
            someone: number
        }
        export type C = A & B;
        `}, 'C', fileName);

        const expected: Schema<'object'> = {
            type: 'object',
            properties: {
                something: {
                    definedAt: '#A',
                    type: 'string'
                },
                someone: {
                    definedAt: '#B',
                    type: 'number'
                }
            },
            required: ['something', 'someone']
        };
        expect(res).to.eql(expected);
    });

    it('should flatten intersection types inside union', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export type A = {
            something:number;
        };
        export type B = {
            somethingElse:string;
        };
        export type C = {
            somethingNew:number;
        };
        export type D = A  |  ( B & C );
        `}, 'D', fileName);

        const expected: Schema<'object'> = {
            $oneOf: [
                {
                    $ref: '#A'
                },
                {
                    type: 'object',
                    properties: {
                        somethingElse: {
                            definedAt: '#B',
                            type: 'string'
                        },
                        somethingNew: {
                            definedAt: '#C',
                            type: 'number'
                        }
                    },
                    required: ['somethingElse', 'somethingNew']
                }
            ]
        };
        expect(res).to.eql(expected);
    });
    it('should deep flatten generic type definition with intersections', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export type MyType<T> = {
            something: {
                a: T;
            };
        };
        export type B = MyType<string> & {id:string};
        `}, 'B', fileName);

        const expected: Schema<'object'> = {
            type: 'object',
            properties: {
                something: {
                    definedAt: '#MyType',
                    type: 'object',
                    properties: {
                        a: {
                            type: 'string'
                        }
                    },
                    required: ['a']
                },
                id: {
                    type: 'string'
                }
            },
            required: ['something', 'id']
        };
        expect(res).to.eql(expected);
    });
});
