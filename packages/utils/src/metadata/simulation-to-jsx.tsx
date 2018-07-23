import React from 'react';
import {ISimulation} from '@ui-autotools/registry';

export function simulationToJSX<T>(Comp: React.ComponentType<T>, simulation: ISimulation<T>) {
  return <Comp {...simulation.props} />;
}
