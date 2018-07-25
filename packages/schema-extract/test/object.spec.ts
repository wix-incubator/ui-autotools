import {expect} from 'chai';
import { ModuleSchema } from '../src/json-schema-types';
import {transformTest} from '../test-kit/run-transform';

describe('schema-extract - objects', () => {
    it('should support "any" object', async () => {
        const moduleId = 'export-types';
        const res = transformTest(`
        import { AType } from './test-assets';

        export let declared_object:Object;
        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            properties: {
                declared_object : {
                    type: 'object',
                },
            },
        };
        expect(res).to.eql(expected);
    });
    it('should objects with properties', async () => {
        const moduleId = 'export-types';
        const res = transformTest(`
        import { AType } from './test-assets';

        export let declared_object:{};

        export let declared_object_with_prop:{
            prop:string
        };

        export let infered_object = {};

        export let infered_object_with_prop = {
            prop:""
        };

        export let declared_with_import:{
            imported:AType
        }
        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            properties: {
                declared_object : {
                    type: 'object',
                },
                declared_object_with_prop: {
                    type: 'object',
                    properties: {
                        prop: {
                            type: 'string',
                        },
                    },
                    required: ['prop']
                },
                infered_object: {
                    type: 'object',
                },
                infered_object_with_prop: {
                    type: 'object',
                    properties: {
                        prop: {
                            type: 'string',
                        },
                    },
                    required: ['prop']
                },
                declared_with_import: {
                    type: 'object',
                    properties: {
                        imported: {
                            $ref: '/src/test-assets#AType',
                        },
                    },
                    required: ['imported']
                },
            },
        };
        expect(res).to.eql(expected);
    });
    it('should suport objects with optional properties', async () => {
        const moduleId = 'export-types';
        const res = transformTest(`
        import { AType } from './test-assets';


        export let declared_object_with_props:{
            prop1?:string
            prop2:number
        };

        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            properties: {

                declared_object_with_props: {
                    type: 'object',
                    properties: {
                        prop1: {
                            type: 'string',
                        },
                        prop2: {
                            type: 'number',
                        },
                    },
                    required: ['prop2']
                },

            },
        };
        expect(res).to.eql(expected);
    });
    it('should objects with index signature', async () => {
        const moduleId = 'index-signatures';
        const res = transformTest(`
        import { AType } from './test-assets';

        export let declared_object_with_index:{[key:string]:string};


        export let declared_object_with_index_and_prop:{
            [key:string]:string,
            cnst:string
        };


        export let declared_object_with_imported_index:{
            [key:string]:AType
        };
        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            properties: {
                declared_object_with_index: {
                    type: 'object',
                    additionalProperties: {
                        type: 'string',
                    },
                },
                declared_object_with_index_and_prop: {
                    type: 'object',
                    properties: {
                        cnst: {
                            type: 'string',
                        },
                    },
                    required: ['cnst'],
                    additionalProperties: {
                        type: 'string',
                    },
                },
                declared_object_with_imported_index: {
                    type: 'object',
                    additionalProperties: {
                        $ref: '/src/test-assets#AType',
                    },
                },
            },
        };
        expect(res).to.eql(expected);
    });

    it('should objects with specific index signature', async () => {
        const moduleId = 'index-signatures';
        const res = transformTest(`
        import { AType } from './test-assets';

        export let declared_object_with_specific_index:{[key in 'a' | 'b']:string};

        export type keys = 'a' | 'b' | 'c'
        export let declared_object_with_specific_index2:{[key in keys]:string};

        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/' + moduleId,
            $ref: 'common/module',
            definitions: {
                keys: {
                    type: 'string',
                    enum: ['a', 'b', 'c']
                },
            },
            properties: {
                declared_object_with_specific_index: {
                    type: 'object',
                    additionalProperties: {
                        type: 'string',
                    },
                    propertyNames: {
                        type: 'string',
                        enum: ['a', 'b']
                    }
                },

                declared_object_with_specific_index2: {
                    type: 'object',
                    additionalProperties: {
                        type: 'string',
                    },
                    propertyNames: {
                        $ref: '#keys'
                    }
                }
            },
        };
        expect(res).to.eql(expected);
    });
});
