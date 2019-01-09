import {expect} from 'chai';
import { Schema } from '../../src/json-schema-types';
import {linkTest} from '../../test-kit/run-linker';

describe('schema-linker - imports', () => {
    it('should link imported generic type definition', async () => {
        const fileName = 'index.ts';
        const res = await linkTest({
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
            definedAt: '#MyType',
            properties: {
                something: {
                    type: 'string'
                }
            },
            required: ['something']
        };
        expect(res).to.eql(expected);
    });

    it('should link 3 levels of inherited interfaces when the two top interfaces are not in the main file', async () => {
        const fileName = 'index.ts';
        const res = await linkTest({
            [fileName]: `
                import {ChildInterface} from './import';
                export interface GrandchildInterface extends ChildInterface {
                    prop3: string;
                }`,
            ['import.ts']: `
                export interface RootInterface {
                    prop1: string;
                }

                export interface ChildInterface extends RootInterface {
                    prop2: string;
                }`
        }, 'GrandchildInterface', fileName);

        const expected: Schema<'object'> = {
            $ref: 'common/interface',
            properties: {
                prop1: {
                    type: 'string',
                    inheritedFrom: '#RootInterface'
                },
                prop2: {
                    type: 'string',
                    inheritedFrom: '#ChildInterface'
                },
                prop3: {
                    type: 'string',
                }
            },
            required: ['prop3', 'prop2', 'prop1']
        };
        expect(res).to.eql(expected);
    });
});
