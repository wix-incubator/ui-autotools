import {expect} from 'chai';
import {runDataLiteralExtract} from '../../test-kit/run-data-literal-exctrator';
import { nodeSymbol } from '../../src/data-literal-transformer';
const testSerialize = (src: string, includeNodes: boolean = false) => runDataLiteralExtract(src, 'a', '/index.tsx', includeNodes);
const literal = (value: any) => ({value, isLiteral: true});
const anExpression = (value: any, expression: string) => ({value, isLiteral: false, expression});
describe ('generate data literals', () => {

    describe('Primitives', () => {
        it('should serialize a string', async () => {
            const {output} = await testSerialize(`
                export const a = 'gaga';
            `);
            expect(output).to.eql(literal('gaga'));
        });
        it('should serialize a number', async () => {
            const {output} = await testSerialize(`
                export const a = 5;
            `);
            expect(output).to.eql( literal(5));
        });
        it('should serialize a boolean', async () => {
            const {output} = await testSerialize(`
                export const a = true;
            `);
            expect(output).to.eql( literal(true));
        });

    });

    describe('objects', () => {
        it('should serialize an object', async () => {
            const {output} = await testSerialize(`
                export const a = {};
            `);
            expect(output).to.eql(literal({}));
        });

        it('should serialize an object with properties', async () => {
            const {output} = await testSerialize(`
                export const a = {
                    b:5
                };
            `);
            expect(output).to.eql( literal({
                b: 5
            }));
        });

        it('should serialize an object with object properties', async () => {
            const {output} = await testSerialize(`
                export const a = {
                    o: {b: 5},
                    j: {c: 4}
                };
            `);
            expect(output).to.eql(literal({
                o: {b: 5},
                j: {c: 4}
            }));
        });
    });

    describe('arrays', () => {
        it('should serialize an array', async () => {
            const {output} = await testSerialize(`
                export const a = [];
            `);
            expect(output).to.eql(literal([]));
        });

        it('should serialize an array with items', async () => {
            const {output} = await testSerialize(`
                export const a = [5, 'gaga'];
            `);
            expect(output).to.eql(literal([5, 'gaga']));
        });
    });

    describe('references', () => {

        it('should serialize an identifier reference', async () => {
            const {output, node} = await testSerialize(`
                export const b = {
                    c:'gaga'
                }
                export const a = b;
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'reference',
                $ref: '#b'
            }, node.getText()));
        });
        it('should serialize a property reference', async () => {
            const {output, node} = await testSerialize(`
                export const b = {
                    c:'gaga'
                }
                export const a = b.c;
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'reference',
                $ref: '#b',
                innerPath: ['c']
            }, node.getText()));
        });

        it('should serialize an element reference', async () => {
            const {output, node} = await testSerialize(`
                export const b = {
                    'c-d':'gaga'
                }
                export const a = b['c-d'];
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'reference',
                $ref: '#b',
                innerPath: ['c-d']
            }, node.getText()));
        });

        it('should serialize an element reference with variable', async () => {
            const {output, node} = await testSerialize(`
                const e = 'c-d';
                export const b = {
                    [e]:'gaga'
                }
                export const a = b[e].length;
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'reference',
                $ref: '#b',
                innerPath: [{
                    __serializedType: 'reference',
                    $ref: '#e'
                }, 'length']
            }, node.getText()));
        });

        it('should serialize a spread', async () => {
            const {output, node} = await testSerialize(`
                export const b = {
                    'c-d':'gaga'
                }
                export const a = {...b};
            `);
            expect(output).to.eql(anExpression({
                __spread0: {
                    __serializedType: 'reference-spread',
                    $ref: '#b'
                }
            }, node.getText()));
        });

        it('should serialize a reference to an import', async () => {
            const {output, node} = await testSerialize(`
                import {b} from './other';
                export const a = b.c;
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'reference',
                $ref: '/other#b',
                innerPath: ['c']
            }, node.getText()));
        });

        it('should serialize a reference to "*" as import', async () => {
            const {output, node} = await testSerialize(`
                import * as d from './other';
                export const a = d.b.c;
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'reference',
                $ref: '/other',
                innerPath: ['b', 'c']
            }, node.getText()));
        });

        it('should serialize a reference to a default import', async () => {
            const {output, node} = await testSerialize(`
                import b from './other';
                export const a = b.c;
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'reference',
                $ref: '/other#default',
                innerPath: ['c']
            }, node.getText()));
        });

        it('should serialize a function call', async () => {
            const {output, node} = await testSerialize(`
                export function func() {}
                export const a = func("xxx", 555);
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'reference-call',
                $ref: '#func',
                args: ['xxx', 555]
            }, node.getText()));
        });

        it('should serialize a function call with inner path', async () => {
            const {output, node} = await testSerialize(`
                export const b = { func:()=>{} }
                export const a = b.func("xxx", 555);
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'reference-call',
                $ref: '#b',
                innerPath: ['func'],
                args: ['xxx', 555]
            }, node.getText()));
        });

        it('should serialize a function call with chaining', async () => {
            const {output, node} = await testSerialize(`
                export const a = b.methodA('a').c.methodB("xxx", 555).methodC();
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'reference-call',
                $ref: '#b',
                innerPath: [
                    'methodA',
                    {
                        __serializedType: 'reference-call',
                        args: ['a']
                    },
                    'c',
                    'methodB',
                    {
                        __serializedType: 'reference-call',
                        args: ['xxx', 555]
                    },
                    'methodC'],
                args: []
            }, node.getText()));
        });

        it('should serialize a function call from an import', async () => {
            const {output, node} = await testSerialize(`
                import {func} from './other';
                export const a = func("xxx", 555);
            `);
            expect(output).to.eql(anExpression( {
                __serializedType: 'reference-call',
                $ref: '/other#func',
                args: ['xxx', 555]
            }, node.getText()));
        });

        it('should serialize an instance creation', async () => {
            const {output, node} = await testSerialize(`
                export class cls() {
                    constructor(name:string){

                    }
                }
                export const a = new cls('gaga');
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'reference-construct',
                $ref: '#cls',
                args: ['gaga']
            }, node.getText()));
        });
        it('should serialize an instance creation with innerPath', async () => {
            const {output, node} = await testSerialize(`
                export class cls() {
                    constructor(name:string){

                    }
                }
                export const b = {cls}
                export const a = new b.cls('gaga');
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'reference-construct',
                $ref: '#b',
                innerPath: ['cls'],
                args: ['gaga']
            }, node.getText()));
        });
    });
    describe('jsx', () => {
        it('should serialize jsx elements', async () => {
            const {output, node} = await testSerialize(`
                import * as React from 'react';
                export const a = <div></div>;
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'jsx-node',
                $ref: 'dom/div',
                tagName: 'div'
            }, node.getText()));
        });
        it('should serialize jsx elements with reference tagname', async () => {
            const {output, node} = await testSerialize(`
                import * as React from 'react';
                import {Button} from './button';
                export const a = <Button></Button>;
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'jsx-node',
                $ref: '/button#Button',
                tagName: 'Button'
            }, node.getText()));
        });
        it('should serialize jsx elements attributes', async () => {
            const {output, node} = await testSerialize(`
                import * as React from 'react';
                export const a = <div a="a"></div>;
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'jsx-node',
                $ref: 'dom/div',
                tagName: 'div',
                attributes: [{
                    __serializedType: 'jsx-attribute',
                    name: 'a',
                    isLiteral: true,
                    value: 'a'
                }]
            }, node.getText()));
        });
        it('should serialize jsx elements spread attributes', async () => {
            const {output, node} = await testSerialize(`
                import * as React from 'react';
                const b = {a:'gaga'};
                export const a = <div {...b}></div>;
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'jsx-node',
                $ref: 'dom/div',
                tagName: 'div',
                attributes: [{
                    __serializedType: 'reference-spread',
                    $ref: '#b'
                }]
            }, node.getText()));
        });
        it('should serialize jsx self closing elements', async () => {
            const {output, node} = await testSerialize(`
                import * as React from 'react';
                export const a = <div a="a"/>;
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'jsx-node',
                $ref: 'dom/div',
                tagName: 'div',
                attributes: [{
                    __serializedType: 'jsx-attribute',
                    name: 'a',
                    isLiteral: true,
                    value: 'a'
                }]
            }, node.getText()));
        });

        it('should serialize jsx elements expressions', async () => {
            const {output, node} = await testSerialize(`
                import * as React from 'react';
                export const a = <div style={{height:'100px'}}></div>;
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'jsx-node',
                $ref: 'dom/div',
                tagName: 'div',
                attributes: [{
                    __serializedType: 'jsx-attribute',
                    name: 'style',
                    isLiteral: true,
                    value: {height: '100px'}
                }]
            }, node.getText()));
        });
        it('should serialize jsx elements expressions', async () => {
            const {output, node} = await testSerialize(`
                import * as React from 'react';
                export const a = <div style={{height:'100px'}}></div>;
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'jsx-node',
                $ref: 'dom/div',
                tagName: 'div',
                attributes: [{
                    __serializedType: 'jsx-attribute',
                    name: 'style',
                    isLiteral: true,
                    value: {height: '100px'}
                }]
            }, node.getText()));
        });
        describe('expressions', async () => {
            it('should serialize trinary expressions', async () => {
                const {output, node} = await testSerialize(`
                    import * as React from 'react';
                    export const b = 'b';
                    export const sometimes = ()=> Math.random() > 0.5;
                    export const a = sometimes() ? 'a' : b;
                `);
                expect(output).to.eql(anExpression({
                    __serializedType: 'common/if',
                    condition: {
                        __serializedType: 'reference-call',
                        $ref: '#sometimes',
                        args: []
                    },
                    whenTrue: 'a',
                    whenFalse: {
                        __serializedType: 'reference',
                        $ref: '#b'
                    }
                }, node.getText()));
            });
        });
        describe('jsx children', async () => {
            it('should serialize jsx text', async () => {
                const {output, node} = await testSerialize(`
                    import * as React from 'react';
                    export const a = <div>hello world</div>;
                `);
                expect(output).to.eql(anExpression({
                    __serializedType: 'jsx-node',
                    $ref: 'dom/div',
                    tagName: 'div',
                    children: ['hello world']
                }, node.getText()));
            });
            it('should serialize jsx children', async () => {
                const {output, node} = await testSerialize(`
                    import * as React from 'react';
                    export const a = <div><div style={{height:'100px'}}></div></div>;
                `);
                expect(output).to.eql(anExpression({
                    __serializedType: 'jsx-node',
                    $ref: 'dom/div',
                    tagName: 'div',
                    children: [
                        {
                            __serializedType: 'jsx-node',
                            tagName: 'div',
                            $ref: 'dom/div',
                            attributes: [{
                                __serializedType: 'jsx-attribute',
                                name: 'style',
                                isLiteral: true,
                                value: {height: '100px'}
                            }]
                        }
                    ]
                }, node.getText()));
            });
            it('should serialize jsx fragments', async () => {
                const {output, node} = await testSerialize(`
                    import * as React from 'react';
                    export const a = <><div style={{height:'100px'}}></div></>;
                `);
                expect(output).to.eql(anExpression({
                    __serializedType: 'jsx-node',
                    $ref: 'dom/fragment',
                    tagName: 'fragment',
                    children: [
                        {
                            __serializedType: 'jsx-node',
                            $ref: 'dom/div',
                            tagName: 'div',
                            attributes: [{
                                __serializedType: 'jsx-attribute',
                                name: 'style',
                                isLiteral: true,
                                value: {height: '100px'}
                            }]
                        }
                    ]
                }, node.getText()));
            });

            it('should serialize jsx child expression', async () => {
                const {output, node} = await testSerialize(`
                    import * as React from 'react';
                    export const b = 'hello world';
                    export const a = <div>{b}</div>;
                `);
                expect(output).to.eql(anExpression({
                    __serializedType: 'jsx-node',
                    $ref: 'dom/div',
                    tagName: 'div',
                    children: [
                        {
                            __serializedType: 'reference',
                            $ref: '#b'
                        }
                    ]
                }, node.getText()));
            });
        });
    });
    describe('boolean operations', () => {
        it('should serialize not expression', async () => {
            const {output, node} = await testSerialize(`
                import * as React from 'react';
                export const b = true;
                export const a = !b;
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'common/not-operator',
                expression: {
                    __serializedType: 'reference',
                    $ref: '#b'
                }

            }, node.getText()));
        });
        it('should serialize parenthesized expression', async () => {
            const {output, node} = await testSerialize(`
                import * as React from 'react';
                export const b = true;
                export const a = (b);
            `);
            expect(output).to.eql(anExpression({
                    __serializedType: 'reference',
                    $ref: '#b'
            }, node.getText()));
        });
    });
    describe('binary operations', () => {
        const inputFactory = (operator: string) => `
        import * as React from 'react';
        export const b = true;
        export const c = false;
        export const a = c ${operator} b;
        `;
        const outputFacotry = (serilizedType: string) => ({
            __serializedType: serilizedType,
            firstOption: {
                __serializedType:  'reference',
                $ref:  '#c'
            },
            secondOption: {
                __serializedType: 'reference',
                $ref: '#b'
            }
        });
        it('should serialize boolean or expression', async () => {
            const {output, node} = await testSerialize(inputFactory('||'));
            expect(output).to.eql(anExpression(outputFacotry('common/binary-or-operator'), node.getText()));
        });
        it('should serialize boolean and expression', async () => {
            const {output, node} = await testSerialize(inputFactory('&&'));
            expect(output).to.eql(anExpression(outputFacotry('common/binary-and-operator'), node.getText()));
        });
        it('should serialize ">" expression', async () => {
            const {output, node} = await testSerialize(inputFactory('>'));
            expect(output).to.eql(anExpression(outputFacotry('common/greater-then-operator'), node.getText()));
        });
        it('should serialize ">=" expression', async () => {
            const {output, node} = await testSerialize(inputFactory('>='));
            expect(output).to.eql(anExpression(outputFacotry('common/equal-greater-then-operator'), node.getText()));
        });
        it('should serialize "<" expression', async () => {
            const {output, node} = await testSerialize(inputFactory('<'));
            expect(output).to.eql(anExpression(outputFacotry('common/lesser-then-operator'), node.getText()));
        });
        it('should serialize "<=" expression', async () => {
            const {output, node} = await testSerialize(inputFactory('<='));
            expect(output).to.eql(anExpression(outputFacotry('common/equal-lesser-then-operator'), node.getText()));
        });
        it('should serialize "===" expression', async () => {
            const {output, node} = await testSerialize(inputFactory('==='));
            expect(output).to.eql(anExpression(outputFacotry('common/equal-operator'), node.getText()));
        });
        it('should serialize "==" expression', async () => {
            const {output, node} = await testSerialize(inputFactory('=='));
            expect(output).to.eql(anExpression(outputFacotry('common/equal-operator'), node.getText()));
        });
        it('should serialize "!==" expression', async () => {
            const {output, node} = await testSerialize(inputFactory('!=='));
            expect(output).to.eql(anExpression(outputFacotry('common/not-equal-operator'), node.getText()));
        });
        it('should serialize "!=" expression', async () => {
            const {output, node} = await testSerialize(inputFactory('!='));
            expect(output).to.eql(anExpression(outputFacotry('common/not-equal-operator'), node.getText()));
        });
        it('should serialize "+" expression', async () => {
            const {output, node} = await testSerialize(inputFactory('+'));
            expect(output).to.eql(anExpression(outputFacotry('common/plus-operator'), node.getText()));
        });
        it('should serialize "-" expression', async () => {
            const {output, node} = await testSerialize(inputFactory('-'));
            expect(output).to.eql(anExpression(outputFacotry('common/minus-operator'), node.getText()));
        });
        it('should serialize "*" expression', async () => {
            const {output, node} = await testSerialize(inputFactory('*'));
            expect(output).to.eql(anExpression(outputFacotry('common/multiplication-operator'), node.getText()));
        });
        it('should serialize "/" expression', async () => {
            const {output, node} = await testSerialize(inputFactory('/'));
            expect(output).to.eql(anExpression(outputFacotry('common/division-operator'), node.getText()));
        });
    });
    describe('arrow functions', () => {
        it('should seriallize simple arrow functions', async () => {
            const {output, node} = await testSerialize(`
                import * as React from 'react';
                export const b = ['a','b'];
                export const a = <div>{
                    b.map((item)=><span>{item}</span>)
                }</div>;
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'jsx-node',
                $ref: 'dom/div',
                tagName: 'div',
                children: [
                    {
                        __serializedType: 'reference-call',
                        $ref: '#b',
                        innerPath: ['map'],
                        args: [
                            {
                                __serializedType: 'function',
                                arguments: ['item'],
                                returns: [{
                                    __serializedType: 'jsx-node',
                                    $ref: 'dom/span',
                                    tagName: 'span',
                                    children: [{
                                        __serializedType: 'reference',
                                        $ref: '#item'
                                    }]
                                }]
                            }
                        ]
                    }
                ]
            }, node.getText()));
        });
        it('should serialize functions', async () => {
            const {output, node} = await testSerialize(`
                import * as React from 'react';
                export const b = ['a','b'];
                export const a = <div>{
                    b.map((function(item){ return <span>{item}</span>})
                }</div>;
            `);
            expect(output).to.eql(anExpression({
                __serializedType: 'jsx-node',
                $ref: 'dom/div',
                tagName: 'div',
                children: [
                    {
                        __serializedType: 'reference-call',
                        $ref: '#b',
                        innerPath: ['map'],
                        args: [
                            {
                                __serializedType: 'function',
                                arguments: ['item'],
                                returns: [{
                                    __serializedType: 'jsx-node',
                                    $ref: 'dom/span',
                                    tagName: 'span',
                                    children: [{
                                        __serializedType: 'reference',
                                        $ref: '#item'
                                    }]
                                }]
                            }
                        ]
                    }
                ]
            }, node.getText()));
        });
        describe('ENV', () => {
            it('should include nodes if requested', async () => {
                const {output, node} = await testSerialize(`
                    import * as React from 'react';
                    export const b = 'hello world';
                    export const a = <div>hello{b.c({c:'c'}).a()}</div>;
                `, true);
                expect(output).to.eql(anExpression({
                    __serializedType: 'jsx-node',
                    $ref: 'dom/div',
                    tagName: 'div',
                    children: [
                        'hello',
                        {
                            __serializedType: 'reference-call',
                            $ref: '#b',
                            innerPath: [
                                'c',
                                {
                                    __serializedType: 'reference-call',
                                    args: [{
                                        c: 'c'
                                    }]
                                },
                                'a'
                            ],
                            args: [],
                        }
                    ]
                }, node.getText()));
                expect(output.value[nodeSymbol]).to.equal(node);
                const funcCall = (node as any).children[1].expression;
                expect(output.value.children[1][nodeSymbol]).to.equal(funcCall);
                expect(output.value.children[1].innerPath[1][nodeSymbol]).to.equal(funcCall.expression.expression);
                expect(() => JSON.stringify(output)).not.to.throw();
            });
        });
    });
});
