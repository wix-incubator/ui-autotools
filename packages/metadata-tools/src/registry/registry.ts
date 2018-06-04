/* tslint:disable:no-invalid-this */
import {IMetadataTools, IMetadata} from './types';
import {ComponentType} from 'react';

export class Metadata<Props> implements IMetadata<Props> {
  simulations: Props[] = []; // Initialize with "empty" simulation

  addSim (sim: Props) {
    this.simulations.push(sim);
  }
}

const Registry: IMetadataTools = {
  metadata: new Map(),
  describe <Props>(comp: ComponentType<Props>): Metadata<Props> {
    if (!this.metadata.has(comp)) {
      this.metadata.set(comp, new Metadata<Props>());
    }

    return this.metadata.get(comp)!;
  },
  clean () {
    this.metadata.clear();
  }
};

Object.freeze(Registry);
export default Registry;
