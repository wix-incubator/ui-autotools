import * as React from 'react';
import ReactDOM from 'react-dom';
import Registry from 'metadata-tools';
import {hydrate} from 'react-dom';
import chai, {expect} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

export const hydrateTests = (): void => {
  describe('Strict mode tests', () => {
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
              if (Comp.name !== 'Modal') {
                // Set root's HTML to the SSR component
                root!.innerHTML = componentStrings[index];
                // Hydrate the component
                hydrate(<Comp {...simulation.props} />, root);
                // Unmount the component
                ReactDOM.unmountComponentAtNode(root as Element);
                index++;
              }
          });

          afterEach(() => {
              consoleSpy.restore();
              errorSpy.restore();
          });

          it(`should render ${Comp.name} to string with props ${JSON.stringify(simulation)} without throwing`, () => {
              // tslint:disable-next-line:no-unused-expression
            expect(consoleSpy).to.not.be.called;
              // tslint:disable-next-line:no-unused-expression
            expect(errorSpy).to.not.be.called;
          });
        }));
      });
    });
  });
};
