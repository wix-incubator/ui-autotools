import * as React from 'react';
import Registry from '../src/registry';
import {expect} from 'chai';

interface ITestProps {
  text: string;
}

const TestComp: React.SFC<ITestProps> = (props: ITestProps) => {
  return <h1>Hey {props.text} person</h1>;
};

const testSim = {
  title: 'testSim',
  props: {
    text: 'person',
  },
};

const testStyle = {
  color: 'red'
};

const testStyleMetadata = {
  name: 'testStyle'
};

describe('Component Metadata', () => {
  beforeEach(() => {
    Registry.clear();
  });

  describe('The addSim method', () => {
    it('adds a new simulation to the component metadata', () => {
      const myCompMetadata = Registry.getComponentMetadata(TestComp);
      myCompMetadata.addSim(testSim);
      expect(myCompMetadata.simulations[0]).to.equal(testSim);
    });
  });

  describe('The addStyle method', () => {
    it('adds a new style to the component metadata', () => {
      const myCompMetadata = Registry.getComponentMetadata(TestComp);
      myCompMetadata.addStyle(testStyle, testStyleMetadata);
      expect(myCompMetadata.styles.get(testStyle)).to.equal(testStyleMetadata);
    });
  });
});
