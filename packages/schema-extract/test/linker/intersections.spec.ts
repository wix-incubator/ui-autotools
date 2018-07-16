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
                    type: 'number'
                },
                somethingElse: {
                    type: 'string'
                }
            }
        };
        expect(res).to.eql(expected);
    });

    xit('should flatten intersection types with unions', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export type A = {
            something:number;
        };
        export type B = {
            somethingElse:string;
        };
        export type C = {
            somethingElse:number;
        };
        export type D = A  &  ( B | C );
        `}, 'D', fileName);

        const expected: Schema<'object'> = {
            type: 'object',
            properties: {
                something: {
                    type: 'number'
                },
                somethingElse: {
                    $oneOf: [
                        {
                            type: 'string'
                        },
                        {
                            type: 'number'
                        }

                    ]
                }
            }
        };
        expect(res).to.eql(expected);
    });
    it('should deep flatten genric type definition with intersections', async () => {
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
                    type: 'object',
                    properties: {
                        a: {
                            type: 'string'
                        },
                        id: {
                            type: 'string'
                        }
                    }
                }
            }
        };
        expect(res).to.eql(expected);
    });
    it('should deep flatten genric type definition with intersections 2', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export type MyType<T extends object> = {
            something: T & {id:string};
        };
        export type B = MyType<{ title: string}>;
        `}, 'B', fileName);

        const expected: Schema<'object'> = {
            type: 'object',
            properties: {
                something: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string'
                        },
                        id: {
                            type: 'string'
                        }
                    }
                }
            }
        };
        expect(res).to.eql(expected);
    });
    it('should deep flatten genric type definition with intersections 3', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export type MyType<T extends object> = {
            something: T & {id:string};
        };
        export type B = MyType<{ title: string}> &  MyType<{ price: number}>;
        `}, 'B', fileName);

        const expected: Schema<'object'> = {
            type: 'object',
            properties: {
                something: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string'
                        },
                        id: {
                            type: 'string'
                        },
                        price: {
                            type: 'number'
                        }
                    }
                }
            }
        };
        expect(res).to.eql(expected);
    });
});
