import {expect} from 'chai';
import { Schema } from '../../src/json-schema-types';
import {transformTest} from '../../test-kit/run-transform';

describe('schema-linker - generic types', () => {
    it('should flatten genric type definition', async () => {
        const moduleId = 'type-definition';
        const res = transformTest(`
        export type MyType<T> = {
            something:T;
        };
        export type B = MyType<string>;
        `, moduleId);

        const expected: Schema<'object'> = {
            type: 'object',
            properties: {
                something: {
                    type: 'string'
                }
            }
        };
        expect(res).to.eql(expected);
    });

});
