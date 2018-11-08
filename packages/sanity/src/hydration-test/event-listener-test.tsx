import React from 'react';
import ReactDOM from 'react-dom';
import Registry, {getCompName} from '@ui-autotools/registry';
import chai, {expect} from 'chai';
import sinonChai from 'sinon-chai';
import {hydrate} from 'react-dom';
import {AllEvents} from './all-events';
import {overrideEventListeners} from './override-event-listeners';

chai.use(sinonChai);

function assertNoListeners(listeners: {[event: string]: any}, context: string) {
  Object.entries(listeners).forEach((listener) => {
    const listenerType = listener[0];
    const listenerMethods = listener[1];
    expect(listenerMethods.length, `${listenerMethods.length} ${listenerType} event${listenerMethods.length === 1 ? '' : 's'} was not removed from ${context}.`).to.equal(0);
  });
}

/**
 * Event Listener Test
 * The following test checks for event listeners that were not removed after component unmounting.
 * It does this by overriding the default addEventListener and removeEventListener methods on
 * window, document, and body, and proxying them with the original method in addition to our own
 * method which tracks every event that was added or removed. Once the component is unmounted,
 * we are able to check if any events are left.
 */

export const eventListenerTest = (): void => {
  describe('Event Listener test', () => {
    let index = 0;
    const root = document.getElementById('root') as HTMLElement;
    const componentStrings = (window as any).components;
    const matchEverything = /.*/;

    Registry.metadata.components.forEach((componentMetadata, Comp) => {
      describe(getCompName(Comp), () => {
        /**
         * When a React component adds an event listener in its render function (a la <div onClick={this.myOnClick} />),
         * React does not add an event listener to the rendered node. Instead, React calls document.addEventListener and
         * adds a single click event which it then uses to decide which components to call with a synthetic event if
         * relevant. When the component is unmounted, this listener on the document remains, as React may use it for
         * other components. This makes it difficult to know whether a component called document.addEventListener manually
         * and then forgot to remove the listener during unmount, or whether they just used the jsx event syntax properly.
         * To discern between these two cases, we render a component before testing which has a jsx event for every single
         * React-supported event. This way, React will never call document.addEventListener during rendering of the components
         * we want to test, and we can be sure that any remaining events are leftover.
         */
        before(() => {
          ReactDOM.render(<AllEvents />, root);
          ReactDOM.unmountComponentAtNode(root);
        });

        componentMetadata.simulations.forEach((simulation) => {
          it('component should unmount without leaving event listeners on the window, document, and body', () => {
            const {windowEe, documentEe, bodyEe} = overrideEventListeners();

            root.innerHTML = componentStrings[index];
            hydrate(componentMetadata.simulationToJSX(simulation), root);
            ReactDOM.unmountComponentAtNode(root);
            index++;

            assertNoListeners(windowEe.getListeners(matchEverything), 'window');
            assertNoListeners(documentEe.getListeners(matchEverything), 'document');
            assertNoListeners(bodyEe.getListeners(matchEverything), 'body');
          });
        });
      });
    });
  });
};
