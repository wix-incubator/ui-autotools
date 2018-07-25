import * as React from 'react';
import ReactDOM from 'react-dom';
import Registry from '@ui-autotools/registry';
import chai, {expect} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {hydrate} from 'react-dom';

chai.use(sinonChai);

export const hydrationTest = (): void => {
  describe('Hydration test', () => {
    let consoleSpy: sinon.SinonSpy;
    let errorSpy: sinon.SinonSpy;
    const root = document.getElementById('root') as HTMLElement;
    let index = 0;
    const componentStrings = (window as any).components;

    Registry.metadata.components.forEach((metadata, Comp) => {
      describe(Comp.name, () => {
        beforeEach(() => {
          consoleSpy = sinon.spy(console, 'log');
          errorSpy = sinon.spy(console, 'error');
        });

        afterEach(() => {
          consoleSpy.restore();
          errorSpy.restore();
        });

        metadata.simulations.forEach((simulation) => {
          it(`should hydrate component: "${Comp.name}" in strict mode, with props of simulation: "${simulation.title}" without errors`, () => {
            // Set root's HTML to the SSR component
            root.innerHTML = componentStrings[index];
            hydrate(<React.StrictMode>{metadata.simulationToJSX(simulation)}</React.StrictMode>, root);
            ReactDOM.unmountComponentAtNode(root);
            index++;
            // If args is not a primitive, it's not really of interest to us, since any React errors will be
            // strings. Therefore it's fine to print [object Object] in other cases
            const consoleArgs = consoleSpy.getCall(0) ? consoleSpy.getCall(0).args[0] : '';
            const errorArgs = errorSpy.getCall(0) ? errorSpy.getCall(0).args[0] : '';
              // tslint:disable-next-line:no-unused-expression
            expect(consoleSpy, `console was called with:\n ${consoleArgs}`).to.not.be.called;
              // tslint:disable-next-line:no-unused-expression
            expect(errorSpy, `console error was called with:\n ${errorArgs}`).to.not.be.called;
          });
        });
      });
    });
  });
};
