import React from 'react';
import {IComponentMetadata, ISimulation, IStyleMetadata} from './types';
import {isValidSimulationTitle} from '../utils';

export class ComponentMetadata<Props> implements IComponentMetadata<Props> {
  public simulations: Array<ISimulation<Props>> = []; // Initialize with "empty" simulation
  public styles: Map<any, IStyleMetadata> = new Map<any, IStyleMetadata>();

  public constructor(public component: React.ComponentType<Props>) {}

  public addSim(sim: ISimulation<Props>) {
    if (!this.simulations.every((simulation) => simulation.title !== sim.title)) {
      throw new Error(`There's already a simulation with the title ${sim.title}. Titles should be unique.`);
    } else if (!isValidSimulationTitle(sim.title)) {
      throw new Error(`Simulation titles must be alphanumeric.`);
    } else {
      this.simulations.push(sim);
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
