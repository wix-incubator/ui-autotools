/**
 * @jest-environment node
 */
import React from 'react';
import {renderToString} from 'react-dom/server';
import Registry, {getCompName} from '@ui-autotools/registry';
import {expect} from 'chai';

export const ssrTest = (): void => {
    describe('SSR tests', () => {
        it('should be run in an environment without document and window', () => {
            // TODO: check node context
            expect(() => window).to.throw();
            expect(() => document).to.throw();
        });

        Registry.metadata.components.forEach((metadata, Comp) => {
            describe(getCompName(Comp), () => {
                it(`should render component: "${getCompName(Comp)}" to string without throwing`, () => {
                    expect(() => renderToString(<Comp />), 'RenderToString threw an error').not.to.throw();
                });

                metadata.simulations.forEach(((simulation) => {
                    it(`should render component: "${getCompName(Comp)}" to string with props of simulation: "${simulation.title}" without throwing`, () => {
                        expect(() => renderToString(metadata.simulationToJSX(simulation)), 'RenderToString threw an error').not.to.throw();
                    });
                }));
            });
        });
    });
};
