import {expect} from 'chai';
import { ModuleSchema, ModuleSchemaId, ClassSchemaId, FunctionSchemaId, UndefinedSchemaId, ClassConstructorSchemaId } from '../src/json-schema-types';
import {transformTest} from '../test-kit/run-transform';

describe('schema-extract - classes', () => {
    xit('should support classes', async () => {
        const moduleId = 'classes';
        const res = transformTest(`
        import { AClass} from './test-assets'

        /****
         *
         * @props.id the id of the component
         * @props.id:minLength 12
         *
         * **/
        export class MyClass extends AClass{
            static a:string;
            private static b:string;
            a:number = 0;
            constructor(public id:string){
                super();
            }
            setTitle(newtitle:string,prefix:string):void{

            }
        };
        export let param:MyClass;
        export let alias = MyClass;
        `, moduleId);

        const expected: ModuleSchema<'object'> = {
            $schema: 'http://json-schema.org/draft-06/schema#',
            $id: '/src/classes',
            $ref: ModuleSchemaId,
            definitions: {
                MyClass : {
                    $ref: ClassSchemaId,
                    constructor: {
                        $ref: ClassConstructorSchemaId,
                        arguments: [
                            {
                                type: 'string',
                                name: 'id'
                            }
                        ]
                    },
                    staticProperties: {
                        a: {
                            type: 'string'
                        }
                    },
                    extends: {
                        $ref: '/src/test-assets#AClass',
                    },
                    properties: {
                        id: {
                            type: 'string',
                        },
                        a: {
                            type: 'number',
                        },
                        setTitle: {
                            $ref: FunctionSchemaId,
                            arguments: [
                                {type: 'string', name: 'newtitle'},
                                {type: 'string', name: 'prefix'},
                            ],
                            returns: {
                                $ref: UndefinedSchemaId,
                            },
                        },
                    },
                },
            },
            properties: {
                MyClass: {
                    $ref: '#typeof MyClass',
                },
                param: {
                    $ref: '#MyClass',
                },
                alias: {
                    $ref: '#typeof MyClass',
                },
            },
        };
        expect(res).to.eql(expected);
    });
});
