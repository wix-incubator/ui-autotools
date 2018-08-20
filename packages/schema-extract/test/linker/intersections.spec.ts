import {expect} from 'chai';
import { Schema, NeverId, interfaceId } from '../../src/json-schema-types';
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
            },
            required: ['something', 'somethingElse']
        };
        expect(res).to.eql(expected);
    });

    it('should flatten intersection types inside union', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export type A = {
            something:number;
        };
        export type B = {
            somethingElse:string;
        };
        export type C = {
            somethingNew:number;
        };
        export type D = A  |  ( B & C );
        `}, 'D', fileName);

        const expected: Schema<'object'> = {
            $oneOf: [
                {
                    type: 'object',
                    definedAt: '#A',
                    properties: {
                        something: {
                            type: 'number'
                        }
                    },
                    required: ['something']
                },
                {
                    type: 'object',
                    properties: {
                        somethingElse: {
                            type: 'string'
                        },
                        somethingNew: {
                            type: 'number'
                        }
                    },
                    required: ['somethingElse', 'somethingNew']
                }
            ]
        };
        expect(res).to.eql(expected);
    });

    it('should flatten intersection types with unions', async () => {
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
            $oneOf: [
                {
                    type: 'object',
                    properties: {
                        something: {
                            type: 'number'
                        },
                        somethingElse: {
                            type: 'string'
                        }
                    },
                    required: ['something', 'somethingElse']
                },
                {
                    type: 'object',
                    properties: {
                        something: {
                            type: 'number'
                        },
                        somethingElse: {
                            type: 'number'
                        }
                    },
                    required: ['something', 'somethingElse']
                },
            ]
        };
        expect(res).to.eql(expected);
    });
    it('should flatten intersection types with unions 2', async () => {
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
        export type D = (A | B)  &  ( A | C );
        `}, 'D', fileName);

        const expected: Schema<'object'> = {
            $oneOf: [
                {
                    type: 'object',
                    properties: {
                        something: {
                            type: 'number'
                        },
                    },
                    required: ['something']
                },
                {
                    type: 'object',
                    properties: {
                        something: {
                            type: 'number'
                        },
                        somethingElse: {
                            type: 'number'
                        }
                    },
                    required: ['something', 'somethingElse']
                },
                {
                    type: 'object',
                    properties: {
                        something: {
                            type: 'number'
                        },
                        somethingElse: {
                            type: 'string'
                        }
                    },
                    required: ['somethingElse', 'something']
                },
                {
                    type: 'object',
                    properties: {
                        somethingElse: {
                            $ref: NeverId
                        }
                    },
                    required: ['somethingElse']
                },
            ]
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
                        }
                    },
                    required: ['a']
                },
                id: {
                    type: 'string'
                }
            },
            required: ['something', 'id']
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
                    },
                    required: ['title', 'id']
                }
            },
            required: ['something']
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
                    },
                    required: ['title', 'id', 'price']
                }
            },
            required: ['something']
        };
        expect(res).to.eql(expected);
    });
    it('should flatten enums definition with intersections', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export type a = {
            something:string
        }
        export type b = {
            something: 'gaga'
        }
        export type c = a & b;
        `}, 'c', fileName);

        const expected: Schema<'object'> = {
            type: 'object',
            properties: {
                something: {
                    type: 'string',
                    enum: ['gaga'],
                }
            },
            required: ['something']
        };
        expect(res).to.eql(expected);
    });
    it('should flatten enums definition with intersections 2', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export type a = {
            something: 'gaga'
        }
        export type b = {
            something: 'gaga' | 'gugu'
        }
        export type c = a & b;
        `}, 'c', fileName);

        const expected: Schema<'object'> = {
            type: 'object',
            properties: {
                something: {
                    type: 'string',
                    enum: ['gaga'],
                }
            },
            required: ['something']
        };
        expect(res).to.eql(expected);
    });
    it('should flatten enums definition with intersections 3', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export type a = {
            something: 'gaga' | 'gigi'
        }
        export type b = {
            something: 'gaga' | 'gugu'
        }
        export type c = a & b;
        `}, 'c', fileName);

        const expected: Schema<'object'> = {
            type: 'object',
            properties: {
                something: {
                    type: 'string',
                    enum: ['gaga'],
                }
            },
            required: ['something']
        };
        expect(res).to.eql(expected);
    });
    it('should return never if intersection is impossible', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export type a = {
            something:string
        }
        export type b = {
            something: number
        }
        export type c = a & b;
        `}, 'c', fileName);

        const expected: Schema<'object'> = {
            type: 'object',
            properties: {
                something: {
                    $ref: NeverId
                }
            },
            required: ['something']
        };
        expect(res).to.eql(expected);
    });
    it('should properly handle an intersection between a type and interface', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export interface A {
            something:string
        }
        export interface B extends A {
        }
        export type b = {
            someone: number
        }
        export type c = B & b;
        `}, 'c', fileName);

        const expected: Schema<'object'> = {
            $ref: interfaceId,
            properties: {
                something: {
                    inheritedFrom: '#A',
                    type: 'string'
                },
                someone: {
                    type: 'number'
                }
            },
            required: ['something', 'someone']
        };
        expect(res).to.eql(expected);
    });
});
