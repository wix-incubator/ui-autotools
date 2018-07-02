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
        render:  (container: any) => ReactDOM.render(<div id={Comp.name}><Comp {...sim.props} /></div>, container),
        cleanup: () => ReactDOM.unmountComponentAtNode(reactRoot)
      });
    }
  }
  tests.push({
    title: 'broken',
    render: (container: any) => ReactDOM.render(
      <div id="broken">
        <p>Label for this text field.</p>
        <input type="text" id="nolabelfld"/>
      </div>, container)
  });
  tests.push({
    title: 'broken',
    render: (container: any) => ReactDOM.render(
      <div id="broken">
        <p>Label for this text field.</p>
        <input type="text" id="bla"/>
      </div>, container)
  })
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
    if (err) throw err;
    if (result.violations.length) {
      console.log(printViolations(result.violations));
    }
  });
}

function printViolations(violations: axe.Result[], impact: axe.ImpactValue = 'minor'): string {
  let errors: string[] = [];
  let index = 1;
  violations.forEach((violation => {
    if (isImpactRelevant(violation.impact, impact)) {
      violation.nodes.forEach(node => {
        errors.push(`${index++}. \x1b[31m${violation.id === 'duplicate-id' ? 'Document' : node.target[0].replace('#', '')}\x1b[0m: (Impact: ${violation.impact}) ${node.failureSummary}`);
      });
    }
  }))
  return errors.join('\n\n');
}

function isImpactRelevant(impact: axe.ImpactValue, minImpact: axe.ImpactValue): boolean {
  const impactArray = ['minor', 'moderate', 'serious', 'critical'];
  return impactArray.indexOf(impact) >= impactArray.indexOf(minImpact);
}
test(root!);
