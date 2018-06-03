import * as React from 'react';

export interface MetaDataToolsStructure {
  metaData: Map<typeof React.Component | React.StatelessComponent<any>, MetaDataStructure>;
  describe: (comp: typeof React.Component | React.StatelessComponent<any>) => MetaDataStructure;
  clean: () => void;
}

export interface MetaDataStructure {
  simulations: [Simulation];
  addSim: (sim: Simulation) => void;
}

export interface Simulation {
  props?: Object;
}
