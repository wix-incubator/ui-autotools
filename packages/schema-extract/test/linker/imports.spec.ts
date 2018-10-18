import {expect} from 'chai';
import { Schema } from '../../src/json-schema-types';
import {linkTest} from '../../test-kit/run-linker';

describe('schema-linker - imports', () => {
    it('should link imported generic type definition', async () => {
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
});
