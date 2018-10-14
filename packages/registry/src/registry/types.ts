import { ComponentType, ComponentClass } from 'react';

export interface IRegistry<AssetMap = any> {
  metadata: IMetadata;
  getComponentMetadata: <Props, State = {}> (comp: ComponentType<Props> | ComponentClass<Props, State>) => IComponentMetadata<Props, State>;
  clear: () => void;
}

export interface IComponentMetadata<Props, State> {
  component: ComponentType<Props> | ComponentClass<Props, State>;
  exportedFrom: (compInfo: IExportInfo) => void;
  path: string; // TODO: add path verification
  exportName: string;
  baseStylePath: string; // TODO: add path verification
  simulations: Array<ISimulation<Props, State>>;
  styles: Map<any, IStyleMetadata>;
  addSim: (sim: ISimulation<Props, State>) => void;
  addStyle: (style: any, description: IStyleMetadata) => void;
  simulationToJSX: (sim: ISimulation<Props, State>) => JSX.Element;
  reactStrictModeCompliant: boolean;
}

export interface IExportInfo {
  path: string; // TODO: add path verification
  exportName: string;
  baseStylePath: string; // TODO: add path verification
}

export interface IMetadata {
  components: Map<ComponentType<any> | ComponentClass<any, any>, IComponentMetadata<any, any>>;
}

export interface IStyleMetadata {
  name: string;
  path: string;
}

export interface ISimulation<Props, State> {
  title: string;
  props: Props;
  state?: State;
}
