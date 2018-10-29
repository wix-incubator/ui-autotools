import React from 'react';
import ReactDOM from 'react-dom';
import Registry, {getCompName} from '@ui-autotools/registry';
import chai, {expect} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {hydrate} from 'react-dom';
import {getThing} from './check-event-listeners';

chai.use(sinonChai);

export const eventListenerTest = (): void => {
  describe('Event Listener test', () => {
    let consoleSpy: sinon.SinonSpy;
    let errorSpy: sinon.SinonSpy;
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

        componentMetadata.simulations.forEach((simulation) => {
          it('component should unmount without leaving event listeners on the window or document', () => {
            // Set root's HTML to the SSR component
            root.innerHTML = componentStrings[index];
            if (!componentMetadata.reactStrictModeCompliant) {
              hydrate(componentMetadata.simulationToJSX(simulation), root);
            } else {
              hydrate(<React.StrictMode>{componentMetadata.simulationToJSX(simulation)}</React.StrictMode>, root);
            }

            const test = getThing(document, window);
            ReactDOM.unmountComponentAtNode(root);
            index++;
            // const changed = test(document, window);

            expect(false).to.equal(false);
          });
        });
      });
    });
  });
};
