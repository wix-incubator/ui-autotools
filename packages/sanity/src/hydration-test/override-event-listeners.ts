import {ListenerList, Listener} from './listener';

interface IEventEmitterSet {
  windowEe: ListenerList;
  documentEe: ListenerList;
  bodyEe: ListenerList;
  reset: () => void;
}

function setup(eventEmitter: ListenerList, context: any) {
  const oldAddEventListener = context.addEventListener;
  const oldRemoveEventListener = context.removeEventListener;

  context.addEventListener = (...args: any[]) => {
    oldAddEventListener.apply(context, args);
    eventEmitter.add(new Listener(...args));
  };

  context.removeEventListener = (...args: any[]) => {
    oldRemoveEventListener.apply(context, args);
    eventEmitter.remove(new Listener(...args));
  };

  return () => {
    context.addEventListener = oldAddEventListener;
    context.removeEventListener = oldRemoveEventListener;
  };
}

export function overrideEventListeners(): IEventEmitterSet {
  const windowEe = new ListenerList();
  const documentEe = new ListenerList();
  const bodyEe = new ListenerList();

  const resetWindow = setup(windowEe, window);
  const resetDocument = setup(documentEe, document);
  const resetBody = setup(bodyEe, document.body);

  const reset = () => {
    resetWindow();
    resetDocument();
    resetBody();
  };

  return {windowEe, documentEe, bodyEe, reset};
}
