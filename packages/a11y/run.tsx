/* tslint:disable */
import React from 'react';
import ReactDOM from 'react-dom';
import Registry from 'metadata-tools';
import axe from 'axe-core';

function createTestsFromSimulations(reactRoot: any) {
  const tests = [];
  for (const [Comp, meta] of Registry.metadata.components.entries()) {
    for (const [simIndex, sim] of meta.simulations.entries()) {
      tests.push({
        title: Comp.name + ' ' + simIndex,
        render:  (container: any) => ReactDOM.render(<div id="comp"><Comp {...sim.props} /></div>, container),
        cleanup: () => ReactDOM.unmountComponentAtNode(reactRoot)
      });
    }
  }
  return tests;
}

const root = document.getElementById('root');
async function test(rootElement: HTMLElement) {
  const comps = createTestsFromSimulations(root);
  for (const c of comps) {
    const div = document.createElement('div');
    rootElement.appendChild(div);
    await c.render(div);
  }
  axe.run(rootElement, (err: any, result: any) => {
    console.log('err', err);
    console.log('result', result);
  });
}

if (root) {
  test(root);
}
