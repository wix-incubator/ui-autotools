import { ComponentType } from 'react';

export interface IRegistry {
  metadata: IMetadata;
  describeComponent:<Props> (comp: ComponentType<Props>) => IComponentMetadata<Props>;
  describeAsset: (asset: any) => IAssetMetadata;
  clean: () => void;
}

export interface IComponentMetadata<Props> {
  simulations: Simulation<Props>[];
  styles: Map<any, IAssetMetadata>;
  addSim: (sim: Simulation<Props>) => void;
  
  addStyle: (style: any) => void;
}

export interface IMetadata {
  components: Map<ComponentType<any>, IComponentMetadata<any>>;
  assets: Map<any, IAssetMetadata>;
}

export interface IAssetMetadata {
  path: string;
  name: string;
  exports: string[];
}

export interface Simulation<Props> {
  props: Props;
}