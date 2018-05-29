import * as React from 'react';
import MetaDataTools, {MetaData} from '../src/meta-data-tools';
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
    MetaDataTools.clean();
  });

  it('returns an already existing metadata', () => {
    const myCompMetaData = MetaDataTools.describe(TestComp);
    myCompMetaData.addSim(testSim);
    expect(myCompMetaData.simulations[1]).to.equal(testSim);

    const mySecondCompMetaData = MetaDataTools.describe(TestComp);
    expect(mySecondCompMetaData.simulations[1]).to.equal(testSim);
  });

  describe('The Describe method', () => {
    it('adds a new component\'s metadata to the registry, and returns its meta data', () => {
      const myCompMetaData = MetaDataTools.describe(TestComp);
      expect(myCompMetaData).to.be.an.instanceof(MetaData);
    });

    it('returns metadata with an empty simulation by default', () => {
      const myCompMetaData = MetaDataTools.describe(TestComp);
      expect(typeof myCompMetaData.simulations[0]).to.equal('object');
      expect(myCompMetaData.simulations[0]).to.be.empty;
    });
  });

  describe('The addSim method', () => {
    it('adds a new simulation to the component metadata', () => {
      const myCompMetaData = MetaDataTools.describe(TestComp);
      myCompMetaData.addSim(testSim);
      expect(myCompMetaData.simulations[1]).to.equal(testSim);
    });
  });
});
