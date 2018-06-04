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
 
        Registry.metadata.forEach((_value, Key) => {
            describe(Key.name, () => {
                it(`should render ${Key.name} to string without throwing`, () => {
                    expect(() => renderToString(<Key />), 'RenderToString threw an error').not.to.throw();
                });
    
                _value.simulations.forEach(((simulation) => {
                    it(`should render ${Key.name} to string with props ${JSON.stringify(simulation)} without throwing`, () => {
                        expect(() => renderToString(<Key {...simulation} />), 'RenderToString threw an error').not.to.throw();
                    });
                }));
            });
        });
    });
};
