import * as React from 'react';
import Registry, {ComponentMetadata, AssetMetadata, ThemeMetadata} from '../src/registry';
import {expect} from 'chai';

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

  describe('The getAssetMetadata method', () => {
    it('adds a new assets\'s metadata to the registry, and returns its meta data', () => {
      const myAssetMetadata = Registry.getAssetMetadata(TestAsset, 'svg', 'image');
      expect(myAssetMetadata).to.be.an.instanceof(AssetMetadata);
    });

    it('returns an already existing metadata', () => {
      const myAssetMetadata = Registry.getAssetMetadata(TestAsset, 'svg', 'image');
      const mySecondAssetMetadata = Registry.getAssetMetadata(TestAsset, 'svg', 'image');

      expect(mySecondAssetMetadata).to.equal(myAssetMetadata);
    });
  });

  describe('The getThemeMetadata method', () => {
    it('adds a new theme\'s metadata to the registry, and returns its meta data', () => {
      const myThemeMetadata = Registry.getThemeMetadata(testTheme, 'test');
      expect(myThemeMetadata).to.be.an.instanceof(ThemeMetadata);
    });

    it('returns an already existing metadata', () => {
      const myThemeMetadata = Registry.getThemeMetadata(testTheme, 'test');
      const mySecondThemeMetadata = Registry.getThemeMetadata(testTheme, 'test');

      expect(mySecondThemeMetadata).to.equal(myThemeMetadata);
    });
  });

  describe('The clean method', () => {
    it('removes any existing metadata', () => {
      Registry.getComponentMetadata(TestComp);
      Registry.getAssetMetadata(TestAsset, 'svg', 'image');
      Registry.getThemeMetadata(testTheme, 'test');
      expect(Registry.metadata.components.size).to.equal(1);
      expect(Registry.metadata.assets.size).to.equal(1);
      expect(Registry.metadata.themes.size).to.equal(1);

      Registry.clean();

      expect(Registry.metadata.components.size).to.equal(0);
      expect(Registry.metadata.assets.size).to.equal(0);
      expect(Registry.metadata.themes.size).to.equal(0);
    });
  });
});
