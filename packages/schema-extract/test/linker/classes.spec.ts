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
                ]
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
                ]
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

    // xit('should flatten inheritance with generics', async () => {
    //     const fileName = 'index.ts';
    //     const res = linkTest({[fileName]: `
    //     export HTMLButtonElement {
    //         text: string;
    //     }

    //     export interface ButtonProps extends HTMLButtonElement {
    //         /** Text size */
    //         size?: 'small' | 'large';
    //     }

    //     export class Button extends React.Component<ButtonProps, {}> {
    //         static defaultProps: Partial<ButtonProps> = {size: 'small'}
    //         /** does nothing */
    //         focus = () => {}
    //     }
    //     `}, 'Button', fileName);

    //     const expected = {
    //         $ref: ClassSchemaId,
    //         staticProperties: {
    //             defaultProps: {
    //                 size: {
    //                     enum: ['small', 'large'],
    //                     type: 'string'
    //                 }
    //             }
    //         },
    //         extends: {
    //             $ref: '#react!Component',
    //             genericArguments: {
    //                 '?': '?'
    //             }
    //         },
    //         properties: {
    //             focus: {
    //                 description: 'does nothing',
    //                 $ref: 'common/function',
    //                 arguments: [],
    //                 returns: {$ref: 'common/undefined'}
    //             },
    //             props: {
    //                 size: {
    //                     inheritedFrom: '#ButtonProps',
    //                     description: 'Text size',
    //                     enum: ['small', 'large'],
    //                     type: 'string'
    //                 },
    //                 text: {
    //                     inheritedFrom: '#HTMLButtonProps',
    //                     type: 'string'
    //                 }
    //             }
    //         }
    //     };
    //     expect(res).to.eql(expected);
    // });
});
