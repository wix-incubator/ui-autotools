import ReactDOMServer from 'react-dom/server';
import Registry from '@ui-autotools/registry';

export function renderMetadata(): string[] {
  const renderedComps: string[] = [];
  Registry.metadata.components.forEach((metadata) => {
    metadata.simulations.forEach((simulation) => {
      renderedComps.push(ReactDOMServer.renderToString(metadata.simulationToJSX(simulation)));
    });
  });

  return renderedComps;
}
