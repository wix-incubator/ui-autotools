/**
 * @jest-environment node
 */

import * as React from 'react';
import {renderToString} from 'react-dom/server';
import MetaDataTools from 'meta-data-tools';
import {expect} from 'chai';

export const autoSSR = () => {
    describe('AutoSSR tests', () => {
        it('should be run in an environment without document and window', () => {
            expect(() => window).to.throw();
            expect(() => document).to.throw();
        });

        it('should render to string without throwing', () => {
            MetaDataTools.metaData.forEach((_value: any, Key) => {
                expect(() => renderToString(<Key />)).not.to.throw();
            });
        });
    });
};
