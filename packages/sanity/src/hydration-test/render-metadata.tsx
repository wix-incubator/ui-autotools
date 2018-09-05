import {renderToString} from 'react-dom/server';
import Registry from '@ui-autotools/registry';
import {registerRequireHooks, consoleError} from '@ui-autotools/utils';

export function renderMetadata() {
  console.log(222);
  try {
  const renderedComps: string[] = [];
  Registry.metadata.components.forEach((metadata, Comp) => {
    metadata.simulations.forEach(((simulation) => {
      renderedComps.push(renderToString(metadata.simulationToJSX(simulation)));
    }));
  });
} catch (e) {console.log(e);}
  console.log(333);

  return renderedComps;
}
