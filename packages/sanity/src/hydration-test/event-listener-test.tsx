import React from 'react';
import ReactDOM from 'react-dom';
import Registry, {getCompName} from '@ui-autotools/registry';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import {hydrate} from 'react-dom';
import {AllEvents} from './all-events';
import {attachEventListenerLogger} from './override-event-listeners';
import {Listener} from './listener';

chai.use(sinonChai);

function assertNoListeners(listeners: Listener[], eventTarget: string) {
  const errors: string[] = [];
  if (listeners.length) {
    Object.entries(listeners).forEach(([_, handlers]) => {
      errors.push(`A ${handlers.type} event was not removed from ${eventTarget}.`);
    });
  }

  return errors;
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
            const windowLogger = attachEventListenerLogger(window);
            const documentLogger = attachEventListenerLogger(document);
            const bodyLogger = attachEventListenerLogger(document.body);

            root.innerHTML = componentStrings[index];
            hydrate(componentMetadata.simulationToJSX(simulation), root);
            ReactDOM.unmountComponentAtNode(root);
            index++;

            const errors: string[] = [];
            errors.push(...assertNoListeners(windowLogger.listeners.getAll(), 'window'));
            errors.push(...assertNoListeners(documentLogger.listeners.getAll(), 'document'));
            errors.push(...assertNoListeners(bodyLogger.listeners.getAll(), 'body'));

            windowLogger.detach();
            documentLogger.detach();
            bodyLogger.detach();

            if (errors.length) {
              throw Error(errors.join('\n'));
            }
          });
        });
      });
    });
  });
};
