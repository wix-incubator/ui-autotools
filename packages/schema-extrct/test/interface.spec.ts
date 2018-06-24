import {expect} from 'chai';
import { ModuleSchema } from '../src/json-schema-types';
import {transformTest} from '../test-kit/run-transform';

describe('schema-extrct - interfaces', () => {
    it('should support typed interfaces', async () => {
        const moduleId = 'arrays';
        const res = transformTest(`
        import { AType } from './test-assets';

        export interface MyInterface{
            title:string;
        };
        export let param:MyInterface = {} as any;
        export interface Extendz extends MyInterface {
            desc: string;
        }
        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                MyInterface : {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string'
                        }
                    }
                },
                Extendz : {
                    $allOf: [
                        {
                            $ref: '#MyInterface'
                        }, {
                            type: 'object',
                            properties: {
                                desc: {
                                    type: 'string'
                                }
                            }
                        }
                    ]
                }
            },
            properties: {
                param: {
                    $ref: '#MyInterface'
                }
            }
        };
        expect(res).to.eql(expected);
    });
    it('should support recursive interfaces', async () => {
        const moduleId = 'arrays';
        const res = transformTest(`
        import { AType } from './test-assets';

        export interface MyInterface{
            a:MyInterface2;
        };

        export interface MyInterface2{
            b:MyInterface;
        };
        export let param:MyInterface = {} as any;
        export let param2:MyInterface2 = {} as any;

        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                MyInterface : {
                    type: 'object',
                    properties: {
                        a: {
                            $ref: '#MyInterface2'
                        }
                    }
                },
                MyInterface2 : {
                    type: 'object',
                    properties: {
                        b: {
                            $ref: '#MyInterface'
                        }
                    }
                }
            },
            properties: {
                param: {
                    $ref: '#MyInterface'
                },
                param2: {
                    $ref: '#MyInterface2'
                }
            }
        };
        expect(res).to.eql(expected);
    });
});
