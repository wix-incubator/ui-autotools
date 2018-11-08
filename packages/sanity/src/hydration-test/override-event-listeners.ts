import EventEmitter from 'wolfy87-eventemitter';

interface IEventEmitterSet {
  windowEe: EventEmitter;
  documentEe: EventEmitter;
  bodyEe: EventEmitter;
}

function setup(eventEmitter: EventEmitter, context: any) {
  const oldAddEventListener = context.addEventListener;
  const oldRemoveEventListener = context.removeEventListener;

  context.addEventListener = (...args: any[]) => {
    oldAddEventListener.apply(null, args);
    eventEmitter.addListener(args[0], args[1]);
  };

  context.removeEventListener = (...args: any[]) => {
    oldRemoveEventListener.apply(null, args);
    eventEmitter.removeListener(args[0], args[1]);
  };
}

export function overrideEventListeners(): IEventEmitterSet {
  const windowEe = new EventEmitter();
  const documentEe = new EventEmitter();
  const bodyEe = new EventEmitter();

  setup(windowEe, window);
  setup(documentEe, document);
  setup(bodyEe, document.body);

  return {windowEe, documentEe, bodyEe};
}
