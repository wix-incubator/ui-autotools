/* tslint:disable:no-invalid-this */
import {MetaDataToolsStructure, MetaDataStructure, Simulation} from './types';

export class MetaData implements MetaDataStructure {
  simulations: [Simulation] = [{}]; // Initialize with "empty" simulation

  addSim (sim: Simulation) {
    this.simulations.push(sim);
  }
}

const MetaDataTools: MetaDataToolsStructure = {
  metadata: new Map(),
  describe (comp) {
    if (!this.metadata.has(comp)) {
      this.metadata.set(comp, new MetaData());
    }

    return this.metadata.get(comp)!;
  },
  clean () {
    this.metadata.clear();
  }
};

Object.freeze(MetaDataTools);
export default MetaDataTools;
