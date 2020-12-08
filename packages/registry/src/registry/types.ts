import type React from 'react';

export interface IRegistry {
  metadata: IMetadata;
  getComponentMetadata: <Props, State = {}>(
    comp: React.ComponentType<Props> | React.ComponentClass<Props, State>
  ) => IComponentMetadata<Props, State>;
  clear: () => void;
}

export interface IComponentMetadata<Props, State> {
  component: React.ComponentType<Props> | React.ComponentClass<Props, State>;
  simulations: Array<ISimulation<Props, State>>;
  styles: Map<any, IStyleMetadata>;
  addSim: (sim: ISimulation<Props, State>) => void;
  addStyle: (style: any, description: IStyleMetadata) => void;
  simulationToJSX: (sim: ISimulation<Props, State>) => JSX.Element;
  nonReactStrictModeCompliant: boolean;
  nonA11yCompliant: boolean;
  nonEventListenerTestCompliant: boolean;
  nonHydrationTestCompliant: boolean;
  exportInfo: IExportInfo | null;
  addCustomField: (key: string, field: any) => void;
  customFields: { [key: string]: any };
  impact?: 'minor' | 'moderate' | 'serious' | 'critical';
}

export interface IExportInfo {
  path: string;
  exportName: string;
  baseStylePath?: string;
}

export interface IMetadata {
  components: Map<React.ComponentType<any> | React.ComponentClass<any, any>, IComponentMetadata<any, any>>;
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
