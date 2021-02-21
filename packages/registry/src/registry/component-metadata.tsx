import React from 'react';
import type { IComponentMetadata, ISimulation, IStyleMetadata, IExportInfo } from './types';
import { isValidSimulationTitle, getCompWithState } from '../utils';

export class ComponentMetadata<Props, State> implements IComponentMetadata<Props, State> {
  public simulations: Array<ISimulation<Props, State>> = []; // Initialize with "empty" simulation
  public styles: Map<any, IStyleMetadata> = new Map<any, IStyleMetadata>();
  public nonReactStrictModeCompliant = false;
  public nonA11yCompliant = false;
  public nonEventListenerTestCompliant = false;
  public nonHydrationTestCompliant = false;
  public exportInfo: IExportInfo | null = null;
  public customFields: { [key: string]: any } = {};

  public constructor(public component: React.ComponentType<Props>) {}

  public addSim(sim: ISimulation<Props, State>): void {
    if (!this.simulations.every((simulation) => simulation.title !== sim.title)) {
      throw new Error(`There's already a simulation with the title ${sim.title}. Titles should be unique.`);
    } else if (!isValidSimulationTitle(sim.title)) {
      throw new Error(`Simulation titles must be alphanumeric.`);
    } else {
      this.simulations.push(sim);
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public addStyle(style: any, description: IStyleMetadata): void {
    if (!this.styles.has(style)) {
      this.styles.set(style, description);
    }
  }

  public simulationToJSX(simulation: ISimulation<Props, State>): JSX.Element {
    const Comp = this.component;
    if (simulation.state) {
      // Assume that if someone added state to a simulation, the component they're adding it for is NOT a FunctionComponent
      return getCompWithState(Comp as React.ComponentClass<any>, simulation);
    } else {
      return <Comp {...simulation.props} />;
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public addCustomField(key: string, field: any): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.customFields[key] = field;
  }
}
