import * as React from 'react';
import { IComponentMetadata, ISimulation, IStyleMetadata, IExportInfo } from './types';
import { isValidSimulationTitle, getCompWithState } from '../utils';

export class ComponentMetadata<Props, State> implements IComponentMetadata<Props, State> {
  public simulations: Array<ISimulation<Props, State>> = []; // Initialize with "empty" simulation
  public styles: Map<any, IStyleMetadata> = new Map<any, IStyleMetadata>();
  public nonReactStrictModeCompliant: boolean = false;
  public nonA11yCompliant: boolean = false;
  public nonEventListenerTestCompliant: boolean = false;
  public nonHydrationTestCompliant: boolean = false;
  public exportInfo: IExportInfo | null = null;
  public customFields: { [key: string]: any } = {};

  public constructor(public component: React.ComponentType<Props>) {}

  public addSim(sim: ISimulation<Props, State>) {
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

  public simulationToJSX(simulation: ISimulation<Props, State>) {
    const Comp = this.component;
    if (simulation.state) {
      // Assume that if someone added state to a simulation, the component they're adding it for is NOT a FunctionComponent
      return getCompWithState(Comp as React.ComponentClass<any>, simulation);
    } else {
      return <Comp {...simulation.props} />;
    }
  }

  public addCustomField(key: string, field: any) {
    this.customFields[key] = field;
  }
}
