import {IComponentMetadata, ISimulation, IStyleMetadata} from './types';

export default class ComponentMetadata<Props> implements IComponentMetadata<Props> {
  public simulations: Array<ISimulation<Props>> = []; // Initialize with "empty" simulation
  public styles: Map<any, IStyleMetadata> = new Map<any, IStyleMetadata>();

  public addSim(sim: ISimulation<Props>) {
    this.simulations.push(sim);
  }

  public addStyle(style: any, description: IStyleMetadata) {
    if (!this.styles.has(style)) {
      this.styles.set(style, description);
    }
  }
}
