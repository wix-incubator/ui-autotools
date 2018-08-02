import { ComponentType } from 'react';

export interface IRegistry<AssetMap = any> {
  metadata: IMetadata;
  getComponentMetadata: <Props> (comp: ComponentType<Props>) => IComponentMetadata<Props>;
  clear: () => void;
}

export interface IComponentMetadata<Props> {
  component: ComponentType<Props>;
  simulations: Array<ISimulation<Props>>;
  styles: Map<any, IStyleMetadata>;
  addSim: (sim: ISimulation<Props>) => void;
  addStyle: (style: any, description: IStyleMetadata) => void;
  simulationToJSX: (sim: ISimulation<Props>) => JSX.Element;
}

export interface IMetadata {
  components: Map<ComponentType<any>, IComponentMetadata<any>>;
}

export interface IStyleMetadata {
  name: string;
}

export interface ISimulation<Props> {
  title: string;
  props: Props;
  strictMode?: boolean;
}
