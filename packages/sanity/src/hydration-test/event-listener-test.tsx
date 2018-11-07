import React from 'react';
import ReactDOM from 'react-dom';
import Registry, {getCompName} from '@ui-autotools/registry';
import chai, {expect} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {hydrate} from 'react-dom';
import {FloodEvents} from './flood-events';
import {overrideEventListeners} from './override-event-listeners';

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
        before(() => {
          ReactDOM.render(<FloodEvents />, root);
          ReactDOM.unmountComponentAtNode(root);
        });

        beforeEach(() => {
          consoleSpy = sinon.spy(console, 'log');
          errorSpy = sinon.spy(console, 'error');
        });

        afterEach(() => {
          consoleSpy.restore();
          errorSpy.restore();
        });

        componentMetadata.simulations.forEach((simulation) => {
          it('component should unmount without leaving event listeners on the window, document, and body', () => {
            const {windowEe, documentEe, bodyEe} = overrideEventListeners();
            const matchEverything = /.*/;

            // Set root's HTML to the SSR component
            root.innerHTML = componentStrings[index];
            if (!componentMetadata.reactStrictModeCompliant) {
              hydrate(componentMetadata.simulationToJSX(simulation), root);
            } else {
              hydrate(<React.StrictMode>{componentMetadata.simulationToJSX(simulation)}</React.StrictMode>, root);
            }

            ReactDOM.unmountComponentAtNode(root);
            index++;
            const windowListeners = windowEe.getListeners(matchEverything);
            const documentListeners = documentEe.getListeners(matchEverything);
            const bodyListeners = bodyEe.getListeners(matchEverything);

            Object.entries(windowListeners).forEach((listener) => {
              const listenerType = listener[0];
              const listenerMethods = listener[1];
              expect(listenerMethods.length, `${listenerMethods.length} ${listenerType} event${listenerMethods.length === 1 ? '' : 's'} was not removed from window.`).to.equal(0);
            });

            Object.entries(documentListeners).forEach((listener) => {
              const listenerType = listener[0];
              const listenerMethods = listener[1];
              expect(listenerMethods.length, `${listenerMethods.length} ${listenerType} event${listenerMethods.length === 1 ? '' : 's'} was not removed from document.`).to.equal(0);
            });

            Object.entries(bodyListeners).forEach((listener) => {
              const listenerType = listener[0];
              const listenerMethods = listener[1];
              expect(listenerMethods.length, `${listenerMethods.length} ${listenerType} event${listenerMethods.length === 1 ? '' : 's'} was not removed from body.`).to.equal(0);
            });
          });
        });
      });
    });
  });
};
