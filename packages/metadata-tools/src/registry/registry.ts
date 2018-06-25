import {IRegistry, IAssetMetadata, IThemeMetadata} from './types';
import {ComponentType} from 'react';
import ComponentMetadata from './component-metadata';
import Metadata from './metadata';

interface IAssetMap {
  svg: ComponentType;
}

const Registry: IRegistry<IAssetMap> = {
  metadata: new Metadata(),
  describeComponent <Props>(comp: ComponentType<Props>): ComponentMetadata<Props> {
    if (!this.metadata.components.has(comp)) {
      this.metadata.components.set(comp, new ComponentMetadata<Props>());
    }

    return this.metadata.components.get(comp)!;
  },
  describeAsset <AssetType extends keyof IAssetMap, Asset extends IAssetMap[AssetType]>(asset: Asset, type: AssetType, name: string, description?: string): IAssetMetadata {
    // TODO: actually implement
    return this.metadata.assets.get(asset)!;
  },
  describeTheme(theme: any): IThemeMetadata {
    // TODO: actually implement
    return this.metadata.themes.get(theme)!;
  },
  clean() {
    this.metadata.components.clear();
    this.metadata.assets.clear();
    this.metadata.themes.clear();
  },
};

Object.freeze(Registry);
export default Registry;
