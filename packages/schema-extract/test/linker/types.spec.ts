import {expect} from 'chai';
import { Schema } from '../../src/json-schema-types';
import {linkTest} from '../../test-kit/run-linker';

describe('schema-linker - generic types', () => {
    it('should flatten genric type definition', async () => {
        const moduleId = 'type-definition';
        const res = linkTest(`
        export type MyType<T, W> = {
            something:T;
            someone: W;
        };
        export type B = MyType<string, number>;
        `, 'B', moduleId);

        const expected: Schema<'object'> = {
            type: 'object',
            properties: {
                something: {
                    type: 'string'
                },
                someone: {
                    type: 'number'
                }
            }
        };
        expect(res).to.eql(expected);
    });

});
