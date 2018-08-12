import {expect} from 'chai';
import { Schema, interfaceId } from '../../src/json-schema-types';
import {linkTest} from '../../test-kit/run-linker';

describe('schema-linker - imports', () => {
    it('should link imported type definition', async () => {
        const fileName = 'index.ts';
        const res = linkTest({
            [fileName]: `
                import {MyType} from './import';
                export type B = MyType<string>;`,
            ['import.ts']: `
                export type MyType<T> = {
                    something:T;
                };`
        }, 'B', fileName);

        const expected: Schema<'object'> = {
            type: 'object',
            properties: {
                something: {
                    type: 'string'
                }
            },
            required: ['something']
        };
        expect(res).to.eql(expected);
    });

    it('should link imported interfaces', async () => {
        const fileName = 'index.ts';
        const res = linkTest({
            [fileName]: `
                import {MyInterface} from './import';
                export interface A extends MyInterface<string> {
                    someone: number;
                };`,
            ['import.ts']: `
                export interface MyInterface<T> {
                    something:T;
                };`
        }, 'A', fileName);

        const expected: Schema<'object'> = {
            $ref: interfaceId,
            properties: {
                something: {
                    inheritedFrom: '#MyInterface',
                    type: 'string'
                },
                someone: {
                    type: 'number'
                }
            },
            required: ['someone', 'something']
        };
        expect(res).to.eql(expected);
    });

    it('should link imported type from an outside package', async () => {
        const fileName = 'index.ts';
        const res = linkTest({
            [fileName]: `
                import {A} from 'gaga';
                export type B = {id: A} {
                }`,
            node_modules: {
                gaga: {
                    'package.json': '{"name": "gaga", "main": "library.d.ts"}',
                    'library.d.ts': 'export type A = {something: string}'
                }
            }
        }, 'B', fileName);

        const expected = {
            type: 'object',
            properties: {
                id: {
                    type: 'object',
                    definedAt: '#A',
                    properties: {
                        something: {
                            type: 'string'
                        }
                    },
                    required: ['something']
                }
            },
            required: ['id']
        };
        expect(res).to.eql(expected);
    });
});
