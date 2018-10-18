import { expect } from 'chai';
import {MockRegistry, mockData} from '@ui-autotools/test-kit';
import {generateIndexFileData} from '../src/generate-snapshots/build-base-files';

describe('Generating index files', () => {
  it('generates index files from a component and its variants', () => {
    const data = generateIndexFileData(MockRegistry, '');
    console.log('data', data);
    expect(data.f).to.equal(true);
  });
});
