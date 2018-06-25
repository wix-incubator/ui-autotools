import * as React from 'react';
import Registry, {ComponentMetadata, AssetMetadata} from '../src/registry';
import {expect} from 'chai';
import ThemeMetadata from '../src/registry/theme-metadata';

interface ITestProps {
  text: string;
}

const TestComp: React.SFC<ITestProps> = (props: ITestProps) => {
  return <h1>Hey {props.text} person</h1>;
};

const TestAsset: React.SFC = () => {
  return <img src="./branding/logo/PNG/96-logo-OnlySymbol.png" alt="Stylable Intelligence" />;
};

const testTheme = {
  color: 'blue'
};

describe('Registry', () => {
  beforeEach(() => {
    Registry.clean();
  });

  describe('The describeComponent method', () => {
    it('adds a new component\'s metadata to the registry, and returns its meta data', () => {
      const myCompMetadata = Registry.describeComponent(TestComp);
      expect(myCompMetadata).to.be.an.instanceof(ComponentMetadata);
    });

    it('returns an already existing metadata', () => {
      const myCompMetadata = Registry.describeComponent(TestComp);
      const mySecondCompMetadata = Registry.describeComponent(TestComp);

      expect(mySecondCompMetadata).to.equal(myCompMetadata);
    });
  });

  describe('The describeAsset method', () => {
    it('adds a new assets\'s metadata to the registry, and returns its meta data', () => {
      const myAssetMetadata = Registry.describeAsset(TestAsset, 'svg', 'image');
      expect(myAssetMetadata).to.be.an.instanceof(AssetMetadata);
    });

    it('returns an already existing metadata', () => {
      const myAssetMetadata = Registry.describeAsset(TestAsset, 'svg', 'image');
      const mySecondAssetMetadata = Registry.describeAsset(TestAsset, 'svg', 'image');

      expect(mySecondAssetMetadata).to.equal(myAssetMetadata);
    });
  });

  describe('The describeTheme method', () => {
    it('adds a new theme\'s metadata to the registry, and returns its meta data', () => {
      const myThemeMetadata = Registry.describeTheme(testTheme, 'test');
      expect(myThemeMetadata).to.be.an.instanceof(ThemeMetadata);
    });

    it('returns an already existing metadata', () => {
      const myThemeMetadata = Registry.describeTheme(testTheme, 'test');
      const mySecondThemeMetadata = Registry.describeTheme(testTheme, 'test');

      expect(mySecondThemeMetadata).to.equal(myThemeMetadata);
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
