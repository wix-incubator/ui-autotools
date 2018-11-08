import {ListenerList, Listener} from './listener';

interface ILogger {listeners: ListenerList; detach: () => void; }

interface IEventEmitterSet {
  windowLogger: ILogger;
  documentLogger: ILogger;
  bodyLogger: ILogger;
}

function attachEventListenerLogger(target: any): ILogger {
  const {addEventListener, removeEventListener} = target;
  const listeners = new ListenerList();

  const detach = () => {
    target.addEventListener = addEventListener;
    target.removeEventListener = removeEventListener;
  };

  target.addEventListener = (...args: any[]) => {
    addEventListener.apply(target, args);
    listeners.add(new Listener(...args));
  };

  target.removeEventListener = (...args: any[]) => {
    removeEventListener.apply(target, args);
    listeners.remove(new Listener(...args));
  };

  return {listeners, detach};
}

export function overrideEventListeners(): IEventEmitterSet {
  const windowLogger = attachEventListenerLogger(window);
  const documentLogger = attachEventListenerLogger(document);
  const bodyLogger = attachEventListenerLogger(document.body);

  return {windowLogger, documentLogger, bodyLogger};
}
