import * as React from 'react';
import ReactDOM from 'react-dom';
import Registry from 'metadata-tools';
import chai, {expect} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

export const strictModeTests = (): void => {
  describe('Strict mode tests', () => {
    let consoleSpy: sinon.SinonSpy;
    let errorSpy: sinon.SinonSpy;
    const root = document.getElementById('root');

    Registry.metadata.components.forEach((metadata, Comp) => {
      describe(Comp.name, () => {
        metadata.simulations.forEach(((simulation) => {
          beforeEach(() => {
            consoleSpy = sinon.spy(console, 'log');
            errorSpy = sinon.spy(console, 'error');
            // Hydrate the component
            ReactDOM.render(<React.StrictMode><Comp {...simulation.props} /></React.StrictMode>, root);
            // Unmount the component
            ReactDOM.unmountComponentAtNode(root as Element);
          });

          afterEach(() => {
            consoleSpy.restore();
            errorSpy.restore();
          });

          it(`should render ${Comp.name} in strict mode with props ${JSON.stringify(simulation)} without errors`, () => {
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
