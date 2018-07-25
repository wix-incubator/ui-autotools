import {renderToString} from 'react-dom/server';
import Registry from '@ui-autotools/registry';

export function renderMetadata() {
  const renderedComps: string[] = [];
  Registry.metadata.components.forEach((metadata, Comp) => {
    metadata.simulations.forEach(((simulation) => {
      renderedComps.push(renderToString(metadata.simulationToJSX(simulation)));
    }));
  });

  return renderedComps;
}
