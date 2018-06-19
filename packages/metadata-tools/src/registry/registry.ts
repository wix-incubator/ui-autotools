/* tslint:disable:no-invalid-this */
import {IRegistry, IComponentMetadata, Simulation} from './types';
import {ComponentType} from 'react';

export class ComponentMetadata<Props> implements IComponentMetadata<Props> {
  simulations: Simulation<Props>[] = []; // Initialize with "empty" simulation

  addSim (sim: Simulation<Props>) {
    this.simulations.push(sim);
  }
}

const Registry: IRegistry = {
  metadata: new Map(),
  describe <Props>(comp: ComponentType<Props>): ComponentMetadata<Props> {
    if (!this.metadata.has(comp)) {
      this.metadata.set(comp, new ComponentMetadata<Props>());
    }

    return this.metadata.get(comp)!;
  },
  clean () {
    this.metadata.clear();
  }
};

Object.freeze(Registry);
export default Registry;
