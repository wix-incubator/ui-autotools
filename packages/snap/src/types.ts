import { ISimulation, IComponentMetadata, IRegistry } from '@ui-autotools/registry';

export interface ISnapConfig {
  plugins: ISnapPlugin[];
}

export interface ISnapPlugin {
  projectHook?: (snapInfo: ISnapInfo) => Promise<void>;
  componentHook?: (snapInfo: ICompSnapInfo) => Promise<void>;
  simulationHook?: (snapInfo: ISimSnapInfo) => Promise<void>;
  afterHook?: (snapInfo: ISnapInfo, files: ISnapshot[]) => Promise<void>;
}

export interface ISnapInfo {
  Registry: IRegistry;
  projectPath: string;
  collectSnapshot: (snapshot: ISnapshot) => void;
}

export interface ICompSnapInfo extends ISnapInfo {
  componentMetadata: IComponentMetadata<any, any>;
}

export interface ISimSnapInfo extends ICompSnapInfo {
  simulation: ISimulation<any, any>;
}

export interface ISnapshot {
  html: string;
  testName: string;
  staticResources?: ISnapResource[];
}

export interface ISnapResource {
  data: Buffer;
  url: string;
  mimeType: string;
}
