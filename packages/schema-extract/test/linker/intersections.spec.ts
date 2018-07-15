import {expect} from 'chai';
import { Schema } from '../../src/json-schema-types';
import {linkTest} from '../../test-kit/run-linker';

describe('schema-linker - intersections', () => {
    it('should flatten intersection types', async () => {
        const moduleId = 'type-definition';
        const res = linkTest(`
        export type A = {
            something:number;
        };
        export type B = {
            somethingElse:string;
        };
        export type C = A &  B
        `, 'C', moduleId);

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

    it('should flatten intersection types with unions', async () => {
        const moduleId = 'type-definition';
        const res = linkTest(`
        export type A = {
            something:number;
        };
        export type B = {
            somethingElse:string;
        };
        export type C = {
            somethingElse:number;
        };
        export type C = A  &  ( B || C );
        `, 'C', moduleId);

        const expected: Schema<'object'> = {
            type: 'object',
            properties: {
                something: {
                    type: 'number'
                },
                somethingElse: {
                    $oneOf:[
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
        const moduleId = 'type-definition';
        const res = linkTest(`
        export type MyType<T> = {
            something: {
                a: T;
            };
        };
        export type B = MyType<string> & {id:string};
        `, 'B', moduleId);

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
        const moduleId = 'type-definition';
        const res = linkTest(`
        export type MyType<T extends object> = {
            something: T & {id:string};
        };
        export type B = MyType<{ title: string}>;
        `, 'B', moduleId);

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
        const moduleId = 'type-definition';
        const res = linkTest(`
        export type MyType<T extends object> = {
            something: T & {id:string};
        };
        export type B = MyType<{ title: string}> &  MyType<{ price: number}>;
        `, 'B', moduleId);

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
