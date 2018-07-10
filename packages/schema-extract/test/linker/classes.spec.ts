import {expect} from 'chai';
import { ModuleSchema, ModuleSchemaId, ClassSchemaId, FunctionSchemaId, UndefinedSchemaId, ClassConstructorSchemaId, ClassSchema } from '../../src/json-schema-types';
import {transformTest} from '../../test-kit/run-transform';

describe('schema-linker - classes', () => {
    it('should flatten inheritance', async () => {
        const moduleId = 'classes';
        const res = linkTest(`
        export class A{
            static a:string;
            private static b:string;
            a:number = 0;
            constructor(public id:string){
                super();
            }
            setTitle(newtitle:string,prefix:string):void{

            }
        };

        export class B extends A{
            static b:string;
            private static c:string;
            b:number = 0;
            constructor(public id2:string){
                super(id2);
            }
            setTitle(newtitle:string,prefix:string){

            }
        };
        `,'B', moduleId);

        const expected: ClassSchema = {
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
        };
        expect(res).to.eql(expected);
    });
});
