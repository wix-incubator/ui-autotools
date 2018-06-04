import * as React from 'react';
import Registry, {Metadata} from '../src/registry';
import {expect} from 'chai';

interface TestProps {
  text: string;
}

const TestComp: React.SFC<TestProps> = (props: TestProps) => {
  return <h1>Hey {props.text} person</h1>;
};

const testSim = {
    text: 'person'
};

describe('Registry', () => {
  beforeEach(() => {
    Registry.clean();
  });

  it('returns an already existing metadata', () => {
    const myCompMetaData = Registry.describe(TestComp);
    const mySecondCompMetaData = Registry.describe(TestComp);

    expect(mySecondCompMetaData).to.equal(myCompMetaData);
  });

  describe('The Describe method', () => {
    it('adds a new component\'s metadata to the registry, and returns its meta data', () => {
      const myCompMetaData = Registry.describe(TestComp);
      expect(myCompMetaData).to.be.an.instanceof(Metadata);
    });

    it('returns metadata with an empty simulation by default', () => {
      const myCompMetaData = Registry.describe(TestComp);
      expect(typeof myCompMetaData.simulations[0]).to.equal('object');
      expect(myCompMetaData.simulations[0]).to.be.empty;
    });
  });

  describe('The addSim method', () => {
    it('adds a new simulation to the component metadata', () => {
      const myCompMetaData = Registry.describe(TestComp);
      myCompMetaData.addSim(testSim);
      expect(myCompMetaData.simulations[1]).to.equal(testSim);
    });
  });

  describe('The clean method', () => {
    it('removes any existing metadata', () => {
      const myCompMetaData = Registry.describe(TestComp);
      Registry.clean();
      const mySecondCompMetaData = Registry.describe(TestComp);

      expect(mySecondCompMetaData).to.not.equal(myCompMetaData);
    });
  });
});
