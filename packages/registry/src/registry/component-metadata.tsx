import React from 'react';
import {IComponentMetadata, ISimulation, IStyleMetadata} from './types';

export class ComponentMetadata<Props> implements IComponentMetadata<Props> {
  public component: React.ComponentType<Props>;
  public simulations: Array<ISimulation<Props>> = []; // Initialize with "empty" simulation
  public styles: Map<any, IStyleMetadata> = new Map<any, IStyleMetadata>();

  public constructor(component: React.ComponentType<Props>) {
    this.component = component;
  }

  public addSim(sim: ISimulation<Props>) {
    if (this.simulations.every((simulation) => simulation.title !== sim.title)) {
      this.simulations.push(sim);
    } else {
      throw new Error(`There's already a simulation with the title ${sim.title}. Titles should be unique.`);
    }
  }

  public addStyle(style: any, description: IStyleMetadata) {
    if (!this.styles.has(style)) {
      this.styles.set(style, description);
    }
  }

  public simulationToJSX(simulation: ISimulation<Props>) {
    const Comp = this.component;
    return <Comp {...simulation.props} />;
  }
}
