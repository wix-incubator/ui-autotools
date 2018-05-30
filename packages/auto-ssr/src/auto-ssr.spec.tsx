/**
 * @jest-environment node
 */

import * as React from 'react';
import {renderToString} from 'react-dom/server';
import MetaDataTools from 'meta-data-tools';
import {expect} from 'chai';

export const autoSSR = (): void => {
    describe('AutoSSR tests', () => {
        it('should be run in an environment without document and window', () => {
            // TODO: check node context
            expect(() => window).to.throw();
            expect(() => document).to.throw();
        });
 
        MetaDataTools.metaData.forEach((_value: any, Key) => {
            it(`should render ${Key.name} to string without throwing`, () => {
                expect(() => renderToString(<Key />), 'RenderToString threw an error').not.to.throw();
            });
        });
    });
};
