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
                    inheritedFrom: '#TypeA',
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

    it('should flatten interface definitions 2', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export interface TypeA {
            something:string;
        };
        export interface TypeB {
            somethingElse: TypeA
        };
        `}, 'TypeB', fileName);

        const expected: Schema<'object'> = {
            $ref: interfaceId,
            properties: {
                somethingElse: {
                    $ref: interfaceId,
                    definedAt: '#TypeA',
                    properties: {
                        something: {
                            type: 'string'
                        }
                    },
                    required: ['something']
                }
            },
            required: ['somethingElse']
        };
        expect(res).to.eql(expected);
    });

    it('should flatten interface definitions 3', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export interface TypeA {
            something:string;
        };
        export interface TypeB extends TypeA {
            something: 'b';
            somethingElse: number;
        };
        `}, 'TypeB', fileName);

        const expected: Schema<'object'> = {
            $ref: interfaceId,
            properties: {
                somethingElse: {
                    type: 'number'
                },
                something: {
                    enum: ['b'],
                    type: 'string'
                }
            },
            required: ['something', 'somethingElse']
        };
        expect(res).to.eql(expected);
    });

    it('should flatten interfaces that extend an already extended interface', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export interface TypeA {
            something:string;
        };
        export interface TypeB extends TypeA {
            somethingElse: number;
        };

        export interface TypeC extends TypeB {
            somethingNew: boolean;
        }
        `}, 'TypeC', fileName);

        const expected: Schema<'object'> = {
            $ref: interfaceId,
            properties: {
                somethingElse: {
                    inheritedFrom: '#TypeB',
                    type: 'number'
                },
                something: {
                    inheritedFrom: '#TypeA',
                    type: 'string'
                },
                somethingNew: {
                    type: 'boolean'
                }
            },
            required: ['somethingNew', 'somethingElse', 'something']
        };
        debugger;
        expect(res).to.eql(expected);
    });

    it('should flatten interfaces that extend an already extended interface 2', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export interface TypeA<T> {
            something:T;
        };
        export interface TypeB<T, W> extends TypeA<T> {
            somethingElse: W;
        };

        export interface TypeC extends TypeB<string, number> {
            somethingNew: boolean;
        }
        `}, 'TypeC', fileName);

        const expected: Schema<'object'> = {
            $ref: interfaceId,
            properties: {
                somethingElse: {
                    inheritedFrom: '#TypeB',
                    type: 'number'
                },
                something: {
                    inheritedFrom: '#TypeA',
                    type: 'string'
                },
                somethingNew: {
                    type: 'boolean'
                }
            },
            required: ['somethingNew', 'somethingElse', 'something']
        };
        expect(res).to.eql(expected);
    });

    it('should return the correct interface if no flattening is needed', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export interface TypeA {
            something:string;
        };
        `}, 'TypeA', fileName);

        const expected: Schema<'object'> = {
            $ref: interfaceId,
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
