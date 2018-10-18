import { expect } from 'chai';
import {MockRegistry, mockData} from '@ui-autotools/test-kit';
import {generateIndexFileData} from '../src/generate-snapshots/build-base-files';

describe('Generating index file data', () => {
  it('generates the correct data', () => {
    const data = generateIndexFileData(MockRegistry, '');
    expect(data[0].basename).to.equal('MockComp@0@mock simulation@variant');
    expect(data[0].filepath).to.equal('MockComp@0@mock simulation@variant.snapshot.ts');
    expect(data[0].data).to.equal('import style from \'../../src/registry/fixtures/variant.st.css\';\nimport {MockComp} from \'../../src/registry/fixtures/mock-comp\';\nexport default {comp: MockComp, name: \'MockComp\', style};\n');
  });
});
