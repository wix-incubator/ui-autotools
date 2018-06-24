/**
 * @jest-environment node
 */

import * as React from 'react';
import {renderToString} from 'react-dom/server';
import Registry from 'metadata-tools';
import {expect} from 'chai';

export const autoSSR = (): void => {
    describe('AutoSSR tests', () => {
        it('should be run in an environment without document and window', () => {
            // TODO: check node context
            expect(() => window).to.throw();
            expect(() => document).to.throw();
        });

        Registry.metadata.forEach((metadata, Comp) => {
            describe(Comp.name, () => {
                it(`should render ${Comp.name} to string without throwing`, () => {
                    expect(() => renderToString(<Comp />), 'RenderToString threw an error').not.to.throw();
                });

                metadata.simulations.forEach(((simulation) => {
                    it(`should render ${Comp.name} to string with props ${JSON.stringify(simulation)} without throwing`, () => {
                        expect(() => renderToString(<Comp {...simulation.props} />), 'RenderToString threw an error').not.to.throw();
                    });
                }));
            });
        });
    });
};
