import {IRegistry, IAssetMetadata, IThemeMetadata} from './types';
import {ComponentType} from 'react';
import AssetMetadata from './asset-metadata';
import ComponentMetadata from './component-metadata';
import ThemeMetadata from './theme-metadata';
import Metadata from './metadata';

interface IAssetMap {
  svg: ComponentType;
}

const Registry: IRegistry<IAssetMap> = {
  metadata: new Metadata(),
  describeComponent <Props>(comp: ComponentType<Props>): ComponentMetadata<Props> {
    if (!this.metadata.components.has(comp)) {
      this.metadata.components.set(comp, new ComponentMetadata<Props>());
    } else {
      throw new Error('Cannot re-describe a Component. Make sure that you are only trying to describe a Component once.');
    }

    return this.metadata.components.get(comp)!;
  },
  describeAsset <AssetType extends keyof IAssetMap, Asset extends IAssetMap[AssetType]>(asset: Asset, type: AssetType, name: string, description?: string): IAssetMetadata {
    if (!this.metadata.assets.has(asset)) {
      this.metadata.assets.set(asset, new AssetMetadata(type, name, description));
    } else {
      throw new Error('Cannot re-describe an Asset. Make sure that you are only trying to describe an Asset once.');
    }

    return this.metadata.assets.get(asset)!;
  },
  describeTheme(theme: any, name: string): IThemeMetadata {
    if (!this.metadata.themes.has(theme)) {
      this.metadata.themes.set(theme, new ThemeMetadata(name));
    } else {
      throw new Error('Cannot re-describe a Theme. Make sure that you are only trying to describe a Theme once.');
    }

    return this.metadata.themes.get(theme)!;
  },
  clean() {
    this.metadata.components.clear();
    this.metadata.assets.clear();
    this.metadata.themes.clear();
  }
};

Object.freeze(Registry);
export default Registry;
