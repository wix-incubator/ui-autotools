import Registry from '../../src';
import {expect} from 'chai';
import {TestComp} from '../fixtures/component-fixtures';

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
  color: 'red'
};

const testStyleMetadata = {
  name: 'testStyle',
  path: 'blah/blah'
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

  describe('A11y metadata', () => {
    it('returns default value equals to true for a11yCompliant', () => {
      expect(Registry.getComponentMetadata(TestComp).a11yCompliant).to.equal(true);
    });
  });
});
