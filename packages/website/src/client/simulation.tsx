import Registry, {getCompName} from '@ui-autotools/registry';
// TODO: make sure we get the project's React here.
import * as React from 'react';
import * as ReactDOM from 'react-dom';

const url = new URL(document.location.href);
const componentName = url.searchParams.get('component');
const simulationTitle = url.searchParams.get('simulation');

const Comp = Array.from(Registry.metadata.components.keys()).find((c) =>
  getCompName(c) === componentName
);

const compMeta = Comp && Registry.metadata.components.get(Comp);
const sim = compMeta && compMeta.simulations.find(({title}) =>
  title === simulationTitle
);

if (Comp && sim) {
  const root = document.createElement('div');
  document.body.appendChild(root);
  ReactDOM.render(<Comp {...sim.props} />, root);
}
