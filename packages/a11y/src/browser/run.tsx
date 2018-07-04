import React from 'react';
import ReactDOM from 'react-dom';
import Registry from 'metadata-tools';
import axe from 'axe-core';

interface ITest {
  title: string;
  render: (container: HTMLElement) => void;
  cleanup: () => void;
}

export interface IResult {
  comp: string;
  result?: axe.AxeResults;
  error?: Error;
}

function createTestsFromSimulations(reactRoot: any) {
  const tests: ITest[] = [];
  for (const [Comp, meta] of Registry.metadata.components.entries()) {
    meta.simulations.forEach((sim) =>  {
      tests.push({
        title: Comp.displayName ? Comp.displayName : Comp.name,
        render:  (container: HTMLElement) => ReactDOM.render(<div id={Comp.name}><Comp {...sim.props} /></div>, container),
        cleanup: () => ReactDOM.unmountComponentAtNode(reactRoot)
      });
    });
  }
  return tests;
}

const root = document.getElementById('react-root');
async function test(rootElement: HTMLElement) {
  const results: IResult[] = [];
  const comps = createTestsFromSimulations(root);
  for (const c of comps) {
    try {
      const div = document.createElement('div');
      rootElement.appendChild(div);
      await c.render(div);
      const result = await axe.run(rootElement);
      results.push({comp: c.title, result});
      await c.cleanup();
    } catch (error) {
      results.push({comp: c.title, error});
    }
  }
  (window as any).runAxeTest(results);
}

test(root!);
