import React from 'react';
import ReactDOM from 'react-dom';
import Registry, {getCompName} from '@ui-autotools/registry';
import chai, {expect} from 'chai';
import sinonChai from 'sinon-chai';
import {hydrate} from 'react-dom';
import {AllEvents} from './all-events';
import {overrideEventListeners} from './override-event-listeners';

chai.use(sinonChai);

/**
 * Event Listener Test
 * 
 */

export const eventListenerTest = (): void => {
  describe('Event Listener test', () => {
    let index = 0;
    const root = document.getElementById('root') as HTMLElement;
    const componentStrings = (window as any).components;

    Registry.metadata.components.forEach((componentMetadata, Comp) => {
      describe(getCompName(Comp), () => {
        before(() => {
          ReactDOM.render(<AllEvents />, root);
          ReactDOM.unmountComponentAtNode(root);
        });

        componentMetadata.simulations.forEach((simulation) => {
          it('component should unmount without leaving event listeners on the window, document, and body', () => {
            const {windowEe, documentEe, bodyEe} = overrideEventListeners();
            const matchEverything = /.*/;

            // Set root's HTML to the SSR component
            root.innerHTML = componentStrings[index];
            hydrate(componentMetadata.simulationToJSX(simulation), root);
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
