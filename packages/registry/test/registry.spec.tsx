import * as React from 'react';
import Registry, {ComponentMetadata} from '../src/registry';
import {expect} from 'chai';

interface ITestProps {
  text: string;
}

const TestComp: React.SFC<ITestProps> = (props: ITestProps) => {
  return <h1>Hey {props.text} person</h1>;
};

TestComp.displayName = 'Test Comp';

const CopyCatTestComp: React.SFC<ITestProps> = (props: ITestProps) => {
  return <h1>Hey {props.text} person</h1>;
};

CopyCatTestComp.displayName = 'Test Comp';

const NamelessComp: React.SFC<ITestProps> = (props: ITestProps) => {
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

    it('throws if component does not have a "name" or a "displayName" property and does not register the component', () => {
      expect(() => Registry.getComponentMetadata(NamelessComp)).to.throw();
      expect(Registry.metadata.components.size).to.equal(0);
    });

    it('throws if a component already exists with a certain name', () => {
      Registry.getComponentMetadata(TestComp); // Named 'Test Comp'

      expect(() => Registry.getComponentMetadata(CopyCatTestComp)).to.throw(); // Also named 'Test Comp'
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
