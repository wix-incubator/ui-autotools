import {expect} from 'chai'
import { ModuleSchema, ClassConstructorSchemaId, ClassSchemaId } from '../src/json-schema-types'
import {transformTest} from '../test-kit/run-transform'

describe('schema-extrct - comments', () => {
    it('should support comments before vars', async () => {
        const moduleId = 'comments'
        const res = transformTest(`
        /**
         * param documentation
         * @minLength 5
         */
        export let a:string;

        `, moduleId)

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            properties: {
                a: {
                    type: 'string',
                    description: 'param documentation',
                    minLength: 5,
                },
            },
        }

        expect(res).to.eql(expected)
    })
    it('should support comments before types and type members', async () => {
        const moduleId = 'comments'
        const res = transformTest(`
        /**
         * type documentation
         * @zagzag 5
         */
        export type a = {
            /**
             * type member documentation
             * @minLength 5
             */
            prop:string;
        };

        `, moduleId)

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                a: {
                    type: 'object',
                    description: 'type documentation',
                    zagzag: 5,
                    properties: {
                        prop: {
                            type: 'string',
                            description: 'type member documentation',
                            minLength: 5,
                        },
                    },
                },
            },
            properties: {},
        }

        expect(res).to.eql(expected)
    })
    it('should support comments before functions', async () => {
        const moduleId = 'comments'
        const res = transformTest(`
        /**
         * function documentation
         * @param a my parameter documentation
         * @returns {string} return documentation
         */
        export function c(a: string) {
            return '' + a;
        }

        `, moduleId)

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            properties: {
                c: {
                    $ref: 'common/function',
                    description: 'function documentation',
                    arguments: [
                        {
                            type: 'string',
                            description: 'my parameter documentation',
                            name: 'a',
                        },
                    ],
                    returns: {
                        description: 'return documentation',
                        type: 'string',
                    },
                },
            },
        }

        expect(res).to.eql(expected)
    })

    it('should support comments in classes', async () => {
        const moduleId = 'comments'
        const res = transformTest(`
        /**
         * Documentation for C
         */
            export class C {
            /**
             * constructor documentation
             * @param a my parameter documentation
             * @param b another parameter documentation
             */
            constructor(a: string, b: C) { }
        }

        `, moduleId)

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                'typeof C' : {
                    $ref: ClassConstructorSchemaId,
                    description: 'constructor documentation',
                    arguments: [
                        {
                            type: 'string',
                            name: 'a',
                            description: 'my parameter documentation',
                        },
                        {
                            $ref: '#C',
                            name: 'b',
                            description: 'another parameter documentation',
                        },
                    ],
                    returns: {
                        $ref: '#C',
                    },
                    properties: {},
                },
                'C' : {
                    $ref: ClassSchemaId,
                    description: 'Documentation for C',
                    constructor: {
                        $ref: '#typeof C',
                    },
                    properties: {},
                },
            },
            properties: {
                C: {
                    $ref: '#typeof C',
                },
            },
        }
        expect(res).to.eql(expected)
    })

    it('should support comments on class members', async () => {
        const moduleId = 'comments'
        const res = transformTest(`
            export class C {
                /**
                 * member documentation
                 */
                a:string;
            }

        `, moduleId)

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                'typeof C' : {
                    $ref: ClassConstructorSchemaId,
                    arguments: [],
                    returns: {
                        $ref: '#C',
                    },
                    properties: {},
                },
                'C' : {
                    $ref: ClassSchemaId,
                    constructor: {
                        $ref: '#typeof C',
                    },
                    properties: {
                        a: {
                            description: 'member documentation',
                            type: 'string',
                        },
                    },
                },
            },
            properties: {
                C: {
                    $ref: '#typeof C',
                },
            },
        }
        expect(res).to.eql(expected)
    })
})
