/**
 * @jest-environment node
 */
import * as React from 'react';
import {renderToString} from 'react-dom/server';
import Registry from 'metadata-tools';
import chai, {expect} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

export const ssrTest = (): void => {
    describe('SSR tests', () => {
        let consoleSpy: sinon.SinonSpy;

        beforeEach(() => {
            consoleSpy = sinon.spy(console, 'log');
        });

        afterEach(() => {
            test('console should not have been called', () => {
                expect(consoleSpy.notCalled).to.equal(true);
            });
            consoleSpy.restore();
        });

        it('should be run in an environment without document and window', () => {
            // TODO: check node context
            expect(() => window).to.throw();
            expect(() => document).to.throw();
        });

        Registry.metadata.components.forEach((metadata, Comp) => {
            describe(Comp.name, () => {
                it(`should render ${Comp.name} to string without throwing`, () => {
                    expect(() => renderToString(<Comp />), 'RenderToString threw an error').not.to.throw();
                });

                // it('should not print anything to the console', () => {
                //     renderToString(<Comp />);
                //     expect(consoleSpy.notCalled).to.equal(true);
                // });

                metadata.simulations.forEach(((simulation) => {
                    it(`should render ${Comp.name} to string with props ${JSON.stringify(simulation)} without throwing`, () => {
                        expect(() => renderToString(<Comp {...simulation.props} />), 'RenderToString threw an error').not.to.throw();
                    });

                    // it(`should not print anything to the console with props ${JSON.stringify(simulation)}`, () => {
                    //     renderToString(<Comp {...simulation.props} />);
                    //     expect(consoleSpy.notCalled).to.equal(true);
                    // });
                }));
            });
        });
    });
};
