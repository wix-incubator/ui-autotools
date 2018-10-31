import {expect} from 'chai';
import {runDataLiteralExtract} from '../../test-kit/run-data-literal-exctrator';
const testSerialize = (src: string) => runDataLiteralExtract(src, 'a', 'index.tsx');
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
                __serilizedType: 'reference',
                id: '#b'
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
                __serilizedType: 'reference',
                id: '#b',
                innerPath: ['c']
            }, node.getText()));
        });

        it('should serialize an element reference', async () => {
            const {output, node} = await testSerialize(`
                export const b = {
                    c:'gaga'
                }
                export const a = b['c-d'];
            `);
            expect(output).to.eql(anExpression({
                __serilizedType: 'reference',
                id: '#b',
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
                __serilizedType: 'reference',
                id: '#b',
                innerPath: [{
                    __serilizedType: 'reference',
                    id: '#e'
                }, 'length']
            }, node.getText()));
        });

        it('should serialize a reference to an import', async () => {
            const {output, node} = await testSerialize(`
                import {b} from './other';
                export const a = b.c;
            `);
            expect(output).to.eql(anExpression({
                __serilizedType: 'reference',
                id: 'other#b',
                innerPath: ['c']
            }, node.getText()));
        });

        it('should serialize a reference to "*" as import', async () => {
            const {output, node} = await testSerialize(`
                import * as d from './other';
                export const a = d.b.c;
            `);
            expect(output).to.eql(anExpression({
                __serilizedType: 'reference',
                id: 'other',
                innerPath: ['b', 'c']
            }, node.getText()));
        });

        it('should serialize a reference to a default import', async () => {
            const {output, node} = await testSerialize(`
                import b from './other';
                export const a = b.c;
            `);
            expect(output).to.eql(anExpression({
                __serilizedType: 'reference',
                id: 'other#default',
                innerPath: ['c']
            }, node.getText()));
        });

        it('should serialize a function call', async () => {
            const {output, node} = await testSerialize(`
                export function func() {}
                export const a = func("xxx", 555);
            `);
            expect(output).to.eql(anExpression({
                __serilizedType: 'reference-call',
                id: '#func',
                args: ['xxx', 555]
            }, node.getText()));
        });

        it('should serialize a function call from an import', async () => {
            const {output, node} = await testSerialize(`
                import {func} from './other';
                export const a = func("xxx", 555);
            `);
            expect(output).to.eql(anExpression( {
                __serilizedType: 'reference-call',
                id: 'other#func',
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
                __serilizedType: 'reference-construct',
                id: '#cls',
                args: ['gaga']
            }, node.getText()));
        });

    });

});
