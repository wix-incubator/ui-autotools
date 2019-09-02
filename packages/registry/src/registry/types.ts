import { ComponentType, ComponentClass } from 'react';

export interface IRegistry<AssetMap = any> {
  metadata: IMetadata;
  getComponentMetadata: <Props, State = {}>(
    comp: ComponentType<Props> | ComponentClass<Props, State>
  ) => IComponentMetadata<Props, State>;
  clear: () => void;
}

export interface IComponentMetadata<Props, State> {
  component: ComponentType<Props> | ComponentClass<Props, State>;
  simulations: Array<ISimulation<Props, State>>;
  styles: Map<any, IStyleMetadata>;
  addSim: (sim: ISimulation<Props, State>) => void;
  addStyle: (style: any, description: IStyleMetadata) => void;
  simulationToJSX: (sim: ISimulation<Props, State>) => JSX.Element;
  nonReactStrictModeCompliant: boolean;
  nonA11yCompliant: boolean;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  nonEventListenerTestCompliant: boolean;
  nonHydrationTestCompliant: boolean;
  exportInfo: IExportInfo | null;
  staticResources: IStaticResource[];
  addCustomField: (key: string, field: any) => void;
  customFields: { [key: string]: any };
}

export interface IExportInfo {
  path: string; // TODO: add path verification
  exportName: string;
  baseStylePath?: string; // TODO: add path verification
}

export interface IStaticResource {
  path: string;
  url: string;
  mimeType: string;
}

export interface IMetadata {
  components: Map<
    ComponentType<any> | ComponentClass<any, any>,
    IComponentMetadata<any, any>
  >;
}

export interface IStyleMetadata {
  name: string;
  path: string;
}

export interface ISimulation<Props, State> {
  title: string;
  props: Props;
  state?: State;
  staticResources?: IStaticResource[];
}
