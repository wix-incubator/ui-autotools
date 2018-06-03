import { ComponentType } from 'react';

export interface MetadataToolsStructure {
  metadata: Map<ComponentType<any>, MetadataStructure>;
  describe: (comp: ComponentType<any>) => MetadataStructure;
  clean: () => void;
}

export interface MetadataStructure {
  simulations: [Simulation];
  addSim: (sim: Simulation) => void;
}

export interface Simulation {
  props?: Object;
}
