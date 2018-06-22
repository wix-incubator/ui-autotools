import { ComponentType } from 'react';

export interface IRegistry {
  metadata: Map<ComponentType<any>, IComponentMetadata<any>>;
  describe: <Props> (comp: ComponentType<Props>) => IComponentMetadata<Props>;
  clean: () => void;
}

export interface IComponentMetadata<Props> {
  simulations: Array<Simulation<Props>>;
  addSim: (sim: Simulation<Props>) => void;
}

export interface Simulation<Props> {
  props: Props;
}
