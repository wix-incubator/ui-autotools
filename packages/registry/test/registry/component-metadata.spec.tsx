import Registry from '../../src';
import { expect } from 'chai';
import { TestComp } from '../fixtures/component-fixtures';

const testSim = {
  title: 'testSim',
  props: {
    text: 'person',
  },
};

const invalidTitleSim = {
  title: '$$@#$()*E&)SD(*F&DS)F(*&(*$@)($*&@#$(*&',
  props: {
    text: 'person',
  },
};

const testStyle = {
  color: 'red',
};

const testStyleMetadata = {
  name: 'testStyle',
  path: 'blah/blah',
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

    it('throws an error when adding a new simulation to the component metadata if a sim with that title already exists', () => {
      const myCompMetadata = Registry.getComponentMetadata(TestComp);
      myCompMetadata.addSim(testSim);
      expect(myCompMetadata.simulations[0]).to.equal(testSim);
      expect(() => myCompMetadata.addSim(testSim)).to.throw();
    });

    it('throws an error when adding a simulation with an invalid title', () => {
      const myCompMetadata = Registry.getComponentMetadata(TestComp);
      expect(() => myCompMetadata.addSim(invalidTitleSim)).to.throw();
      expect(myCompMetadata.simulations[0]).to.equal(undefined);
    });
  });

  describe('The addStyle method', () => {
    it('adds a new style to the component metadata', () => {
      const myCompMetadata = Registry.getComponentMetadata(TestComp);
      myCompMetadata.addStyle(testStyle, testStyleMetadata);
      expect(myCompMetadata.styles.get(testStyle)).to.equal(testStyleMetadata);
    });
  });

  describe('Opt-out flags', () => {
    it('defaults to false for nonA11yCompliant', () => {
      expect(Registry.getComponentMetadata(TestComp).nonA11yCompliant).to.equal(false);
    });

    it('defaults to false for nonReactStrictModeCompliant', () => {
      expect(Registry.getComponentMetadata(TestComp).nonReactStrictModeCompliant).to.equal(false);
    });

    it('defaults to false for nonEventListenerTestCompliant', () => {
      expect(Registry.getComponentMetadata(TestComp).nonEventListenerTestCompliant).to.equal(false);
    });

    it('defaults to false for nonHydrationTestCompliant', () => {
      expect(Registry.getComponentMetadata(TestComp).nonHydrationTestCompliant).to.equal(false);
    });
  });
});
