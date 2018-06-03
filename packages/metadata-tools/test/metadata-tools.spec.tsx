import * as React from 'react';
import MetadataTools, {Metadata} from '../src/metadata-tools';
import {expect} from 'chai';

interface TestProps {
  text: string;
}

const TestComp: React.SFC<TestProps> = (props: TestProps) => {
  return <h1>Hey {props.text} person</h1>;
};

const testSim: {props: TestProps} = {
  props: {
    text: 'person'
  }
};

describe('MetaData Tools', () => {
  beforeEach(() => {
    MetadataTools.clean();
  });

  it('returns an already existing metadata', () => {
    const myCompMetaData = MetadataTools.describe(TestComp);
    const mySecondCompMetaData = MetadataTools.describe(TestComp);

    expect(mySecondCompMetaData).to.equal(myCompMetaData);
  });

  describe('The Describe method', () => {
    it('adds a new component\'s metadata to the registry, and returns its meta data', () => {
      const myCompMetaData = MetadataTools.describe(TestComp);
      expect(myCompMetaData).to.be.an.instanceof(Metadata);
    });

    it('returns metadata with an empty simulation by default', () => {
      const myCompMetaData = MetadataTools.describe(TestComp);
      expect(typeof myCompMetaData.simulations[0]).to.equal('object');
      expect(myCompMetaData.simulations[0]).to.be.empty;
    });
  });

  describe('The addSim method', () => {
    it('adds a new simulation to the component metadata', () => {
      const myCompMetaData = MetadataTools.describe(TestComp);
      myCompMetaData.addSim(testSim);
      expect(myCompMetaData.simulations[1]).to.equal(testSim);
    });
  });

  describe('The clean method', () => {
    it('removes any existing metadata', () => {
      const myCompMetaData = MetadataTools.describe(TestComp);
      MetadataTools.clean();
      const mySecondCompMetaData = MetadataTools.describe(TestComp);

      expect(mySecondCompMetaData).to.not.equal(myCompMetaData);
    });
  });
});
