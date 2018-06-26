import {IRegistry, IAssetMetadata, IThemeMetadata} from './types';
import {ComponentType} from 'react';
import {AssetMetadata} from './asset-metadata';
import {ComponentMetadata} from './component-metadata';
import {ThemeMetadata} from './theme-metadata';
import Metadata from './metadata';

interface IAssetMap {
  svg: ComponentType;
}

const Registry: IRegistry<IAssetMap> = {
  metadata: new Metadata(),
  getComponentMetadata <Props>(comp: ComponentType<Props>): ComponentMetadata<Props> {
    if (!this.metadata.components.has(comp)) {
      this.metadata.components.set(comp, new ComponentMetadata<Props>());
    }

    return this.metadata.components.get(comp)!;
  },
  getAssetMetadata <AssetType extends keyof IAssetMap, Asset extends IAssetMap[AssetType]>(asset: Asset, type: AssetType, name: string, description?: string): IAssetMetadata {
    if (!this.metadata.assets.has(asset)) {
      this.metadata.assets.set(asset, new AssetMetadata(type, name, description));
    }

    return this.metadata.assets.get(asset)!;
  },
  getThemeMetadata(theme: any, name: string): IThemeMetadata {
    if (!this.metadata.themes.has(theme)) {
      this.metadata.themes.set(theme, new ThemeMetadata(name));
    }

    return this.metadata.themes.get(theme)!;
  },
  clear() {
    this.metadata.components.clear();
    this.metadata.assets.clear();
    this.metadata.themes.clear();
  }
};

Object.freeze(Registry);
export default Registry;
