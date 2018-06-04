import { ComponentType } from 'react';

export interface IMetadataTools {
  metadata: Map<ComponentType<any>, IMetadata<any>>;
  describe:<Props> (comp: ComponentType<Props>) => IMetadata<Props>;
  clean: () => void;
}

export interface IMetadata<Props> {
  simulations: Props[];
  addSim: (sim: Props) => void;
}
