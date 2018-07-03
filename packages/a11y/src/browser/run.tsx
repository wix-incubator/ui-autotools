import React from 'react';
import ReactDOM from 'react-dom';
import Registry from 'metadata-tools';
import axe from 'axe-core';

interface ITest {
  render: (container: HTMLElement) => void;
  cleanup: () => void;
}

function createTestsFromSimulations(reactRoot: any) {
  const tests: ITest[] = [];
  for (const [Comp, meta] of Registry.metadata.components.entries()) {
    meta.simulations.forEach((sim) => {
      tests.push({
        render:  (container: HTMLElement) => ReactDOM.render(<div id={Comp.name}><Comp {...sim.props} /></div>, container),
        cleanup: () => ReactDOM.unmountComponentAtNode(reactRoot)
      });
    });
  }
  tests.push({
    render:  (container: any) => ReactDOM.render(<div id="nolabelfld"><p>Label for this text field.</p></div>, container),
    cleanup: () => ReactDOM.unmountComponentAtNode(reactRoot)
  });
  tests.push({
    render:  (container: any) => ReactDOM.render(<div id="nolabelfld"><p>Label for this text field.</p></div>, container),
    cleanup: () => ReactDOM.unmountComponentAtNode(reactRoot)
  });
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
  axe.run(rootElement, (err: Error, result: axe.AxeResults) => {
    if (err) {
      throw err;
    }
    (window as any).runAxeTest(result);
  });
}

test(root!);
