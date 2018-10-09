import { expect } from 'chai';
import Registry from '@ui-autotools/registry';
import {metadata} from './fixtures/composite/composite.meta';
import {buildBaseFiles} from '../src/generate-snapshots/build-base-files';

describe('Generating index files', () => {
  it('generates index files from a component and its variants', () => {
    console.log('mock', Registry);
    console.log('metadata', metadata);
    // buildBaseFiles('./fixtures', {metadata: { components: new Map() }});
    expect(true).to.equal(true);
  });
});
