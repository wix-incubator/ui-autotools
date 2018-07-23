import {renderToString} from 'react-dom/server';
import Registry from '@ui-autotools/registry';
import {simulationToJSX} from '@ui-autotools/utils';

export function renderMetadata() {
  const renderedComps: string[] = [];
  Registry.metadata.components.forEach((metadata, Comp) => {
    metadata.simulations.forEach(((simulation) => {
      renderedComps.push(renderToString(simulationToJSX(Comp, simulation)));
    }));
  });

  return renderedComps;
}
