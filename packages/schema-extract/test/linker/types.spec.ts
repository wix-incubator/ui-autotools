import {expect} from 'chai';
import { Schema } from '../../src/json-schema-types';
import {linkTest} from '../../test-kit/run-linker';

describe('schema-linker - generic types', () => {
    it('should flatten genric type definition', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export type MyType<T, W> = {
            something:W;
            someone: T;
        };
        export type B = MyType<string, number>;
        `}, 'B', fileName);

        const expected: Schema<'object'> = {
            type: 'object',
            properties: {
                something: {
                    type: 'number'
                },
                someone: {
                    type: 'string'
                }
            }
        };
        expect(res).to.eql(expected);
    });

    it('should deep flatten genric type definition', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export type MyType<T> = {
            something: {
                a: T;
            };
        };
        export type B = MyType<string>;
        `}, 'B', fileName);

        const expected: Schema<'object'> = {
            type: 'object',
            properties: {
                something: {
                    type: 'object',
                    properties: {
                        a: {
                            type: 'string'
                        }
                    }
                }
            }
        };
        expect(res).to.eql(expected);
    });

    it('should return the reference type when refering to a different type', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export type MyType = {
            something:string;
            someone:number;
        };
        export type B = MyType;
        `}, 'B', fileName);

        const expected: Schema<'object'> = {
            type: 'object',
            properties: {
                something: {
                    type: 'string'
                },
                someone: {
                    type: 'number'
                }
            },
            required: ['something', 'someone']
        };
        expect(res).to.eql(expected);
    });
});
