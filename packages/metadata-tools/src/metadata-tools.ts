/* tslint:disable:no-invalid-this */
import {MetadataToolsStructure, MetadataStructure, Simulation} from './types';

export class Metadata implements MetadataStructure {
  simulations: [Simulation] = [{}]; // Initialize with "empty" simulation

  addSim (sim: Simulation) {
    this.simulations.push(sim);
  }
}

const MetadataTools: MetadataToolsStructure = {
  metadata: new Map(),
  describe (comp) {
    if (!this.metadata.has(comp)) {
      this.metadata.set(comp, new Metadata());
    }

    return this.metadata.get(comp)!;
  },
  clean () {
    this.metadata.clear();
  }
};

Object.freeze(MetadataTools);
export default MetadataTools;
