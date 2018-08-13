import {expect} from 'chai';
import { ClassSchemaId, FunctionSchemaId, UndefinedSchemaId, ClassConstructorSchemaId } from '../../src/json-schema-types';
import {linkTest} from '../../test-kit/run-linker';

describe('schema-linker - classes', () => {
    it('should flatten inheritance', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export class A{
            /** static property desc A*/
            static a:string;
            private static b:string;
            a:number = 0;
            constructor(public id:string){
                super();
            }
            /** original property description */
            setTitle(newtitle:string,prefix:string):void{

            }
        };

        export class B extends A{
            static c:string;
            private static d:string;
            c:number = 0;
            constructor(public id2:string){
                super(id2);
            }
            /** property description */
            setTitle(newtitle:string,prefix:string){

            }
        };
        `}, 'B', fileName);

        const expected = {
            $ref: ClassSchemaId,
            constructor: {
                $ref: ClassConstructorSchemaId,
                arguments: [
                    {
                        type: 'string',
                        name: 'id2'
                    }
                ],
                requiredArguments: ['id2']
            },
            staticProperties: {
                a: {
                    inheritedFrom: '#A',
                    description: 'static property desc A',
                    type: 'string'
                },
                c: {
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
                    default: 0
                },
                id2: {
                    type: 'string',
                },
                c: {
                    type: 'number',
                    default: 0
                },
                setTitle: {
                    $ref: FunctionSchemaId,
                    inheritedFrom: '#A',
                    description: 'property description',
                    arguments: [
                        {type: 'string', name: 'newtitle'},
                        {type: 'string', name: 'prefix'},
                    ],
                    requiredArguments: [
                        'newtitle',
                        'prefix'
                    ],
                    returns: {
                        $ref: UndefinedSchemaId,
                    },
                },
            },
        };
        expect(res).to.eql(expected);
    });

    it('should flatten inheritance with no constructor', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export class A{
            constructor(public id:string){
                super();
            }
        };

        export class B extends A{};
        `}, 'B', fileName);

        const expected = {
            $ref: ClassSchemaId,
            constructor: {
                $ref: ClassConstructorSchemaId,
                arguments: [
                    {
                        type: 'string',
                        name: 'id'
                    }
                ],
                requiredArguments: ['id']
            },
            staticProperties: {},
            extends: {
                $ref: '#A',
            },
            properties: {
                id: {
                    inheritedFrom: '#A',
                    type: 'string'
                }
            }
        };
        expect(res).to.eql(expected);
    });

    it('should flatten inheritance with generics', async () => {
        const fileName = 'index.ts';
        const res = linkTest({[fileName]: `
        export class A<T, W>{
            static a: T;
            b: W
        };

        export class B<G> extends A<string, G>{};
        `}, 'B', fileName);

        const expected = {
            $ref: ClassSchemaId,
            genericParams: [{
                name: 'G'
            }],
            staticProperties: {
                a: {
                    inheritedFrom: '#A',
                    type: 'string'
                }
            },
            extends: {
                $ref: '#A',
            },
            properties: {
                b: {
                    inheritedFrom: '#A',
                    $ref: '#B!G'
                }
            }
        };
        expect(res).to.eql(expected);
    });
});
