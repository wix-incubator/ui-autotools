import {ListenerList, Listener} from './listener';

interface ILogger {
  listeners: ListenerList;
  detach: () => void;
}

export function attachEventListenerLogger(target: EventTarget): ILogger {
  const {addEventListener, removeEventListener} = target;
  const listeners = new ListenerList();

  const detach = () => {
    target.addEventListener = addEventListener;
    target.removeEventListener = removeEventListener;
  };

  target.addEventListener = (...args: [string, EventListener]) => {
    addEventListener.apply(target, args);
    listeners.add(new Listener(...args));
  };

  target.removeEventListener = (...args: [string, EventListener]) => {
    removeEventListener.apply(target, args);
    listeners.remove(new Listener(...args));
  };

  return {listeners, detach};
}
