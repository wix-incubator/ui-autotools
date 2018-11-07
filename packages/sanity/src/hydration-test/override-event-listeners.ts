import EventEmitter from 'wolfy87-eventemitter';

interface IEventEmitterSet {
  windowEe: EventEmitter;
  documentEe: EventEmitter;
  bodyEe: EventEmitter;
}

export function overrideEventListeners(): IEventEmitterSet {
  const windowEe = new EventEmitter();
  const documentEe = new EventEmitter();
  const bodyEe = new EventEmitter();

  const oldWindowEventListener = window.addEventListener;
  window.addEventListener = (...args: any[]) => {
    oldWindowEventListener.apply(null, args);
    windowEe.addListener(args[0], args[1]);
  };

  const oldWindowRemoveEventListener = window.removeEventListener;
  window.removeEventListener = (...args: any[]) => {
    oldWindowRemoveEventListener.apply(null, args);
    windowEe.removeListener(args[0], args[1]);
  };

  const oldDocumentEventListener = document.addEventListener;
  document.addEventListener = (...args: any[]) => {
    oldDocumentEventListener.apply(null, args);
    documentEe.addListener(args[0], args[1]);
  };

  const oldDocumentRemoveEventListener = document.removeEventListener;
  document.removeEventListener = (...args: any[]) => {
    oldDocumentRemoveEventListener.apply(null, args);
    documentEe.removeListener(args[0], args[1]);
  };

  const oldBodyAddEventListener = document.body.addEventListener;
  document.body.addEventListener = (...args: any[]) => {
    oldBodyAddEventListener.apply(null, args);
    bodyEe.addListener(args[0], args[1]);
  };

  const oldBodyRemoveEventListener = document.body.removeEventListener;
  document.body.removeEventListener = (...args: any[]) => {
    oldBodyRemoveEventListener.apply(null, args);
    bodyEe.removeListener(args[0], args[1]);
  };

  return {windowEe, documentEe, bodyEe};
}
