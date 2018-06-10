import { ComponentType } from 'react';

export interface IRegistry {
  metadata: IMetadata;
  describeComponent:<Props> (comp: ComponentType<Props>) => IComponentMetadata<Props>;
  describeAsset: (asset: Style | Icon) => Style | Icon;
  clean: () => void;
}

export interface IComponentMetadata<Props> {
  simulations: Simulation<Props>[];
  styles: Style[];
  addSim: (sim: Simulation<Props>) => void;
  
  addStyle: (style: Style) => void;
}

export interface IMetadata {
  components: Map<ComponentType<any>, IComponentMetadata<any>>;
  assets: IAssets;
}

export interface IAssets {
  styles: Style[];
  icons: Icon[];
}

export interface Style {
  path: string;
  name: string;
  exports: any;
}

export interface Icon {
  path: string;
  name: string;
  exports: any;
}

export interface Simulation<Props> {
  props: Props;
}