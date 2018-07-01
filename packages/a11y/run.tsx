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
    console.log('result', result);
    if (result.violations.length) {
      console.log(printViolations(result.violations));
    }
  });
}

function printViolations(violations: axe.Result[], impact: axe.ImpactValue = 'minor'): string {
  let errors: string[] = [];
  violations.forEach(((violation, index) => {
    if (isImpactRelevant(violation.impact, impact)) {
      const node = violation.nodes[0];
      if (violation.id === 'duplicate-id') {
        errors.push(`${index + 1}. Document: (Impact: ${violation.impact}) ${node.failureSummary}`);
      } else {
        errors.push(`${index + 1}. ${node.target[0].replace('#', '')}: (Impact: ${violation.impact}) ${node.failureSummary}`);
      }
    }
  }))
  return errors.join('\n');
}

function isImpactRelevant(impact: axe.ImpactValue, minImpact: axe.ImpactValue): boolean {
  const impactArray = ['minor', 'moderate', 'serious', 'critical'];
  return impactArray.indexOf(impact) >= impactArray.indexOf(minImpact);
}

test(root!);
