import {expect} from 'chai';
import { ClassSchemaId, FunctionSchemaId, UndefinedSchemaId, ClassConstructorSchemaId } from '../../src/json-schema-types';
import {linkTest} from '../../test-kit/run-linker';

describe('schema-linker - classes', () => {
    it('should flatten inheritance', async () => {
        const moduleId = 'classes';
        const res = linkTest(`
        export class A{
            /* static property desc A */
            static a:string;
            private static b:string;
            a:number = 0;
            constructor(public id:string){
                super();
            }
            /* original property description */
            setTitle(newtitle:string,prefix:string):void{

            }
        };

        export class B extends A{
            static b:string;
            private static d:string;
            c:number = 0;
            constructor(public id2:string){
                super(id2);
            }
            /* property description */
            setTitle(newtitle:string,prefix:string){

            }
        };
        `, 'B', moduleId);

        const expected = {
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
                    inheritedFrom: '#A',
                    description: 'static property desc A',
                    type: 'string'
                },
                b: {
                    type: 'string'
                }
            },
            extends: {
                $ref: '#A',
            },
            properties: {
                id: {
                    inheritedFrom: '#A',
                    type: 'string',
                },
                a: {
                    inheritedFrom: '#A',
                    type: 'number',
                },
                id2: {
                    type: 'string',
                },
                c: {
                    type: 'number',
                },
                setTitle: {
                    $ref: FunctionSchemaId,
                    inheritedFrom: '#A',
                    description: 'property description',
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
