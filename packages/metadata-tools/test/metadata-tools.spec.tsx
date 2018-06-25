import * as React from 'react';
import Registry, {ComponentMetadata} from '../src/registry';
import {expect} from 'chai';

interface ITestProps {
  text: string;
}

const TestComp: React.SFC<ITestProps> = (props: ITestProps) => {
  return <h1>Hey {props.text} person</h1>;
};

const testSim = {
  props: {
    text: 'person',
  },
};

describe('Registry', () => {
  beforeEach(() => {
    Registry.clean();
  });

  it('returns an already existing metadata', () => {
    const myCompMetaData = Registry.describeComponent(TestComp);
    const mySecondCompMetaData = Registry.describeComponent(TestComp);

    expect(mySecondCompMetaData).to.equal(myCompMetaData);
  });

  describe('The describeComponent method', () => {
    it('adds a new component\'s metadata to the registry, and returns its meta data', () => {
      const myCompMetaData = Registry.describeComponent(TestComp);
      expect(myCompMetaData).to.be.an.instanceof(ComponentMetadata);
    });
  });

  describe('The addSim method', () => {
    it('adds a new simulation to the component metadata', () => {
      const myCompMetaData = Registry.describeComponent(TestComp);
      myCompMetaData.addSim(testSim);
      expect(myCompMetaData.simulations[0]).to.equal(testSim);
    });
  });

  describe('The clean method', () => {
    it('removes any existing metadata', () => {
      Registry.describeComponent(TestComp);
      expect(Registry.metadata.components.size).to.equal(1);

      Registry.clean();

      expect(Registry.metadata.components.size).to.equal(0);
    });
  });
});
