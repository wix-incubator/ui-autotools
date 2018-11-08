import EventEmitter from 'wolfy87-eventemitter';

interface IEventEmitterSet {
  windowEe: EventEmitter;
  documentEe: EventEmitter;
  bodyEe: EventEmitter;
  reset: () => void;
}

function setup(eventEmitter: EventEmitter, context: any) {
  const oldAddEventListener = context.addEventListener;
  const oldRemoveEventListener = context.removeEventListener;

  context.addEventListener = (...args: any[]) => {
    oldAddEventListener.apply(context, args);
    eventEmitter.addListener(args[0], args[1]);
  };

  context.removeEventListener = (...args: any[]) => {
    oldRemoveEventListener.apply(context, args);
    eventEmitter.removeListener(args[0], args[1]);
  };

  return () => {
    context.addEventListener = oldAddEventListener;
    context.removeEventListener = oldRemoveEventListener;
  };
}

export function overrideEventListeners(): IEventEmitterSet {
  const windowEe = new EventEmitter();
  const documentEe = new EventEmitter();
  const bodyEe = new EventEmitter();

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
