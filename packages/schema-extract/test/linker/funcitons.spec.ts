import {expect} from 'chai';
import { FunctionSchemaId, FunctionSchema } from '../../src/json-schema-types';
import {linkTest} from '../../test-kit/run-linker';

describe('schema-linker - functions', () => {
    it('should flatten function definitions', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export type MyType = {
            name: string;
        }
        export function MyFunc(o: MyType) {
            return o.name;
        };
        `}, 'MyFunc', fileName);

        const expected: FunctionSchema = {
            $ref: FunctionSchemaId,
            arguments: [
                {
                    name: 'o',
                    type: 'object',
                    definedAt: '#MyType',
                    properties: {
                        name: {
                            type: 'string'
                        }
                    },
                    required: ['name']
                }
            ],
            requiredArguments: ['o'],
            returns: {
                type: 'string'
            }
        };
        expect(res).to.eql(expected);
    });

    it('should flatten generic function definitions', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export function MyGenericFunc<T>(o: T) {
            return o;
        };
        `}, 'MyGenericFunc', fileName);

        const expected: FunctionSchema = {
            $ref: FunctionSchemaId,
            arguments: [
                {
                    name: 'o',
                    $ref: '#MyGenericFunc!T'
                }
            ],
            genericParams: [{name: 'T'}],
            requiredArguments: ['o'],
            returns: {
                type: 'object'
            }
        };
        expect(res).to.eql(expected);
    });

    it('should flatten generic function definitions 2', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export type Func<T> = (x: T) => T;
        export const MyFunc: Func<number> = (x) => {
            return x;
        }
        `}, 'MyFunc', fileName);

        const expected: FunctionSchema = {
            $ref: FunctionSchemaId,
            definedAt: '#Func',
            arguments: [
                {
                    name: 'x',
                    type: 'number'
                }
            ],
            requiredArguments: ['x'],
            returns: {
                type: 'number'
            }
        };
        expect(res).to.eql(expected);
    });
});
