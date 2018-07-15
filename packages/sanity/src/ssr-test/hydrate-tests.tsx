import * as React from 'react';
import ReactDOM from 'react-dom';
import Registry from 'metadata-tools';
import {hydrate} from 'react-dom';
import chai, {expect} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

export const hydrateTests = (): void => {
  describe('Hydration tests', () => {
    let consoleSpy: sinon.SinonSpy;
    let errorSpy: sinon.SinonSpy;
    let index = 0;
    const componentStrings = (window as any).components;
    const root = document.getElementById('root');

    Registry.metadata.components.forEach((metadata, Comp) => {
      describe(Comp.name, () => {
        metadata.simulations.forEach(((simulation) => {
          beforeEach(() => {
              consoleSpy = sinon.spy(console, 'log');
              errorSpy = sinon.spy(console, 'error');
              // Set root's HTML to the SSR component
              root!.innerHTML = componentStrings[index];
              // Hydrate the component
              hydrate(<Comp {...simulation.props} />, root);
              // Unmount the component
              ReactDOM.unmountComponentAtNode(root as Element);
              index++;
          });

          afterEach(() => {
              consoleSpy.restore();
              errorSpy.restore();
          });

          it(`should hydrate ${Comp.name} with props ${JSON.stringify(simulation)} without errors`, () => {
            const consoleArgs = consoleSpy.getCall(0) ? consoleSpy.getCall(0).args[0] : '';
            const errorArgs = errorSpy.getCall(0) ? errorSpy.getCall(0).args[0] : '';
              // tslint:disable-next-line:no-unused-expression
            expect(consoleSpy, `console was called with:\n ${consoleArgs}`).to.not.be.called;
              // tslint:disable-next-line:no-unused-expression
            expect(errorSpy, `console error was called with:\n ${errorArgs}`).to.not.be.called;
          });
        }));
      });
    });
  });
};
