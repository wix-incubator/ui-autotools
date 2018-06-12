import { ComponentType } from 'react';

export interface IRegistry<AssetMap> {
  metadata: IMetadata;
  describeComponent:<Props> (comp: ComponentType<Props>) => IComponentMetadata<Props>;
  describeAsset:<AssetType extends keyof AssetMap, Asset extends AssetMap[AssetType]> (asset: Asset, type: AssetType, name: string, description?: string) => IAssetMetadata<AssetType>;
  describeTheme: (style: any) => IStyleMetadata;
  clean: () => void;
}

export interface IComponentMetadata<Props> {
  simulations: Simulation<Props>[];
  styles: Map<any, IStyleMetadata>;
  addSim: (sim: Simulation<Props>) => void;
  addStyle: (style: any) => void;
}

export interface IMetadata {
  components: Map<ComponentType<any>, IComponentMetadata<any>>;
  assets: Map<any, IAssetMetadata<any>>;
  themes: Map<any, IStyleMetadata>;
}

export interface IAssetMetadata<AssetType> {
  type: AssetType;
  name: string;
  description?: string;
}

export interface IStyleMetadata {
  name: string;
}
export interface Simulation<Props> {
  props: Props;
}