import {expect} from 'chai';
import {getTypescriptSchema, renderSchema} from '../test-kit';

describe('Basic types', () => {
  it('Primitive types', async () => {
    const node = renderSchema(getTypescriptSchema(`
      export interface X {
        a: any;
        b: boolean;
        n: number;
        nu: null;
        s: string;
        u: undefined;
      }
    `, 'X'));
    expect(node.textContent).equal('{a: any, b: boolean, n: number, nu: null, s: string, u: undefined}');
  });

  it('Interfaces', async () => {
    const node = renderSchema(getTypescriptSchema(`
      export interface X {
        req: {n: number};
        opt?: boolean;
      }
    `, 'X'));
    expect(node.textContent).equal('{req: {n: number}, opt?: boolean}');
  });

  describe('Arrays', async () => {
    it('Simple type', async () => {
      const node = renderSchema(getTypescriptSchema(`
        export type X = string[];
      `, 'X'));
      expect(node.textContent).equal('string[]');
    });

    it('Complex type', async () => {
      const node = renderSchema(getTypescriptSchema(`
        export type X = Array<string | number>;
      `, 'X'));
      expect(node.textContent).equal('Array<string | number>');
    });
  });

  describe('Functions', async () => {
    it('Optional and rest args', async () => {
      const node = renderSchema(getTypescriptSchema(`
        export function x(a: string, b: number = 3, c?: boolean, ...rest: any[]) {
          return Math.random() < 0.5;
        }
      `, 'x'));
      expect(node.textContent).equal('(a: string, b?: number = 3, c?: boolean, ...rest: any[]) => boolean');
    });

    it('Noop', async () => {
      const node = renderSchema(getTypescriptSchema(`
        export function x() {};
      `, 'x'));
      expect(node.textContent).equal('() => void');
    });
  });

  describe('Unions', async () => {
    it('Uniform union', async () => {
      const node = renderSchema(getTypescriptSchema(`
        export type X = 'hello' | 'world';
      `, 'X'));
      expect(node.textContent).equal('"hello" | "world"');
    });

    it('Non-uniform union', async () => {
      const node = renderSchema(getTypescriptSchema(`
        export type X = 'hello' | false | number | true;
      `, 'X'));
      expect(node.textContent).equal('number | "hello" | boolean');
    });
  });
});
