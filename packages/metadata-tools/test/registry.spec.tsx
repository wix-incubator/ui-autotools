import * as React from 'react';
import Registry, {ComponentMetadata} from '../src/registry';
import {expect} from 'chai';

interface ITestProps {
  text: string;
}

const TestComp: React.SFC<ITestProps> = (props: ITestProps) => {
  return <h1>Hey {props.text} person</h1>;
};

describe('Registry', () => {
  beforeEach(() => {
    Registry.clear();
  });

  describe('The getComponentMetadata method', () => {
    it('adds a new component\'s metadata to the registry, and returns its meta data', () => {
      const myCompMetadata = Registry.getComponentMetadata(TestComp);
      expect(myCompMetadata).to.be.an.instanceof(ComponentMetadata);
    });

    it('returns an already existing metadata', () => {
      const myCompMetadata = Registry.getComponentMetadata(TestComp);
      const mySecondCompMetadata = Registry.getComponentMetadata(TestComp);

      expect(mySecondCompMetadata).to.equal(myCompMetadata);
    });
  });

  describe('The clear method', () => {
    it('removes any existing metadata', () => {
      Registry.getComponentMetadata(TestComp);
      expect(Registry.metadata.components.size).to.equal(1);

      Registry.clear();

      expect(Registry.metadata.components.size).to.equal(0);
    });
  });
});
