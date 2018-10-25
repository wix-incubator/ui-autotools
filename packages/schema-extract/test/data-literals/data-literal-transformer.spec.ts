import {expect} from 'chai';
import {runDataLiteralExtract} from '../../test-kit/run-data-literal-exctrator';
const testSerialize = (src: string) => runDataLiteralExtract(src, 'a', 'index.tsx');
describe ('generate data literals', () => {

    describe('Primitives', () => {
        it('should serialize a string', async () => {
            const res = await testSerialize(`
                export const a = 'gaga';
            `);
            expect(res).to.equal('gaga');
        });
        it('should serialize a number', async () => {
            const res = await testSerialize(`
                export const a = 5;
            `);
            expect(res).to.equal( 5);
        });
        it('should serialize a boolean', async () => {
            const res = await testSerialize(`
                export const a = true;
            `);
            expect(res).to.equal( true);
        });

    });

    describe('objects', () => {
        it('should serialize an object', async () => {
            const res = await testSerialize(`
                export const a = {};
            `);
            expect(res).to.eql( {});
        });

        it('should serialize an object with properties', async () => {
            const res = await testSerialize(`
                export const a = {
                    b:5
                };
            `);
            expect(res).to.eql( {
                b: 5
            });
        });

        it('should serialize an object with object properties', async () => {
            const res = await testSerialize(`
                export const a = {
                    o: {b: 5},
                    j: {c: 4}
                };
            `);
            expect(res).to.eql( {
                o: {b: 5},
                j: {c: 4}
            });
        });
    });

    describe('arrays', () => {
        it('should serialize an array', async () => {
            const res = await testSerialize(`
                export const a = [];
            `);
            expect(res).to.eql( []);
        });

        it('should serialize an array with items', async () => {
            const res = await testSerialize(`
                export const a = [5, 'gaga'];
            `);
            expect(res).to.eql( [5, 'gaga']);
        });
    });

    describe('references', () => {

        it('should serialize an identifier reference', async () => {
            const res = await testSerialize(`
                export const b = {
                    c:'gaga'
                }
                export const a = b;
            `);
            expect(res).to.eql( {
                __serilizedType: 'reference',
                id: '"/index".b',
                symbolPath: ''
            });
        });
        it('should serialize a property reference', async () => {
            const res = await testSerialize(`
                export const b = {
                    c:'gaga'
                }
                export const a = b.c;
            `);
            expect(res).to.eql( {
                __serilizedType: 'reference',
                id: '"/index".b',
                symbolPath: '.c'
            });
        });

        it('should serialize an element reference', async () => {
            const res = await testSerialize(`
                export const b = {
                    c:'gaga'
                }
                export const a = b['c-d'];
            `);
            expect(res).to.eql( {
                __serilizedType: 'reference',
                id: '"/index".b',
                symbolPath: "['c-d']"
            });
        });

        it('should serialize an element reference with variable', async () => {
            const res = await testSerialize(`
                export const b = {
                    c:'gaga'
                }
                const e = 'c-d';
                export const a = b[e];
            `);
            expect(res).to.eql( {
                __serilizedType: 'reference',
                id: '"/index".b',
                symbolPath: '[e]'
            });
        });

        it('should serialize a reference to an import', async () => {
            const res = await testSerialize(`
                import {b} from './other';
                export const a = b.c;
            `);
            expect(res).to.eql( {
                __serilizedType: 'reference',
                id: '"./other".b',
                symbolPath: '.c'
            });
        });

        it('should serialize a reference to "*" as import', async () => {
            const res = await testSerialize(`
                import * as d from './other';
                export const a = d.b.c;
            `);
            expect(res).to.eql( {
                __serilizedType: 'reference',
                id: '"./other"',
                symbolPath: '.b.c'
            });
        });

        it('should serialize a reference to a default import', async () => {
            const res = await testSerialize(`
                import b from './other';
                export const a = b.c;
            `);
            expect(res).to.eql( {
                __serilizedType: 'reference',
                id: '"./other".default',
                symbolPath: '.c'
            });
        });

        it('should serialize a function call', async () => {
            const res = await testSerialize(`
                export function func() {}
                export const a = func("xxx", 555);
            `);
            expect(res).to.eql( {
                __serilizedType: 'reference-call',
                id: '"/index".func',
                args: ['xxx', 555]
            });
        });

        it('should serialize a function call from an import', async () => {
            const res = await testSerialize(`
                import {func} from './other';
                export const a = func("xxx", 555);
            `);
            expect(res).to.eql( {
                __serilizedType: 'reference-call',
                id: '"./other".func',
                args: ['xxx', 555]
            });
        });

        it('should serialize an instance creation', async () => {
            const res = await testSerialize(`
                export class cls() {
                    constructor(name:string){

                    }
                }
                export const a = new cls('gaga');
            `);
            expect(res).to.eql( {
                __serilizedType: 'reference-construct',
                id: '"/index".cls',
                args: ['gaga']
            });
        });

    });

});
