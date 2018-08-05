import {expect} from 'chai';
import { Schema, interfaceId } from '../../src/json-schema-types';
import {linkTest} from '../../test-kit/run-linker';

describe('schema-linker - interfaces', () => {
    it('should flatten interface definitions', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export interface TypeA<T> {
            something:T;
        };
        export interface TypeB extends TypeA<string> {
            somethingElse: number
        };
        `}, 'TypeB', fileName);

        const expected: Schema<'object'> = {
            $ref: interfaceId,
            properties: {
                something: {
                    type: 'string'
                },
                somethingElse: {
                    type: 'number'
                }
            },
            required: ['somethingElse', 'something']
        };
        expect(res).to.eql(expected);
    });
});
