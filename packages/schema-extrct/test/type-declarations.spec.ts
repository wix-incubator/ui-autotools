import {expect} from 'chai';
import { ModuleSchema } from '../src/json-schema-types';
import {transformTest} from '../test-kit/run-transform';

describe('schema-extrct - type declarations', () => {
    it('should support type definition', async () => {
        const moduleId = 'type-definition';
        const res = transformTest(`
        import { AType } from './test-assets';

        export type MyType = {
            title:string;
            imported:AType;
        };
        export let param:MyType;
        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                MyType : {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string'
                        },
                        imported: {
                            $ref: '/src/test-assets#AType'
                        }
                    }
                }
            },
            properties: {
                param: {
                    $ref: '#MyType'
                }
            }
        };
        expect(res).to.eql(expected);
    });
    it('should support type alias', async () => {
        const moduleId = 'type-alias';
        const res = transformTest(`
        export type alias = string;
        export let param:alias;
        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                alias : {
                    type: 'string'
                }
            },
            properties: {
                param: {
                    $ref: '#alias'
                }
            }
        };
        expect(res).to.eql(expected);
    });

    it('should support recursive types', async () => {
        const moduleId = 'type-recurse';
        const res = transformTest(`
        export type recurse = {
            prop:recurse;
        };
        export let param:recurse;
        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                recurse : {
                    type: 'object',
                    properties : {
                        prop: {
                            $ref: '#recurse'
                        }
                    }
                }
            },
            properties: {
                param: {
                    $ref: '#recurse'
                }
            }
        };
        expect(res).to.eql(expected);
    });
});
