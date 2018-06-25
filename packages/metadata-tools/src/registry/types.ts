import { ComponentType } from 'react';

export interface IRegistry<AssetMap = any> {
  metadata: IMetadata;
  describeComponent: <Props> (comp: ComponentType<Props>) => IComponentMetadata<Props>;
  describeAsset: <AssetType extends keyof AssetMap, Asset extends AssetMap[AssetType]> (asset: Asset, type: AssetType, name: string, description?: string) => IAssetMetadata;
  describeTheme: (theme: any) => IThemeMetadata;
  clean: () => void;
}

export interface IComponentMetadata<Props> {
  simulations: Array<ISimulation<Props>>;
  styles: Map<any, IStyleMetadata>;
  addSim: (sim: ISimulation<Props>) => void;
  addStyle: (style: any, description: IStyleMetadata) => void;
}

export interface IMetadata {
  components: Map<ComponentType<any>, IComponentMetadata<any>>;
  assets: Map<any, IAssetMetadata>;
  themes: Map<any, IStyleMetadata>;
}

export interface IAssetMetadata {
  type: string;
  name: string;
  description?: string;
}

export interface IStyleMetadata {
  name: string;
}

export interface IThemeMetadata {
  name: string;
}

export interface ISimulation<Props> {
  props: Props;
}
