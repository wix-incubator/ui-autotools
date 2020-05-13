import React from 'react';
import ReactDOM from 'react-dom';
import Registry, { getCompName } from '@ui-autotools/registry';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

const hydrate = ReactDOM.hydrate || ReactDOM.render;

chai.use(sinonChai);

export const hydrationTest = (): void => {
  describe('Hydration test', () => {
    let consoleSpy: sinon.SinonSpy<Parameters<Console['log']>, ReturnType<Console['log']>>;
    let errorSpy: sinon.SinonSpy<Parameters<Console['error']>, ReturnType<Console['error']>>;
    const root = document.getElementById('root') as HTMLElement;
    let index = 0;
    const componentStrings = (window as any).components;

    Registry.metadata.components.forEach((componentMetadata, Comp) => {
      describe(getCompName(Comp), () => {
        beforeEach(() => {
          consoleSpy = sinon.spy(console, 'log');
          errorSpy = sinon.spy(console, 'error');
        });

        afterEach(() => {
          consoleSpy.restore();
          errorSpy.restore();
        });

        if (!componentMetadata.nonHydrationTestCompliant) {
          componentMetadata.simulations.forEach((simulation) => {
            const testMessage = `should ${'hydrate' in ReactDOM ? 'hydrate' : 'render'} component: "${getCompName(
              Comp
            )}"${componentMetadata.nonReactStrictModeCompliant ? '' : ' in strict mode'}, with props of simulation: "${
              simulation.title
            }" without errors`;
            it(testMessage, () => {
              // Set root's HTML to the SSR component
              root.innerHTML = componentStrings[index];
              if (componentMetadata.nonReactStrictModeCompliant) {
                hydrate(componentMetadata.simulationToJSX(simulation), root);
              } else {
                hydrate(<React.StrictMode>{componentMetadata.simulationToJSX(simulation)}</React.StrictMode>, root);
              }
              ReactDOM.unmountComponentAtNode(root);
              index++;
              // If args is not a primitive, it's not really of interest to us, since any React errors will be
              // strings. Therefore it's fine to print [object Object] in other cases
              const consoleArgs = consoleSpy.getCall(0) ? consoleSpy.getCall(0).args[0] : '';
              const errorArgs = errorSpy.getCall(0) ? errorSpy.getCall(0).args[0] : '';
              expect(consoleSpy, `console was called with:\n ${consoleArgs}`).to.not.be.called;
              expect(errorSpy, `console error was called with:\n ${errorArgs}`).to.not.be.called;
            });
          });
        }
      });
    });
  });
};
