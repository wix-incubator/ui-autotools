function isObject(val: any) {
  return val && typeof val === 'object';
}

export class Listener {
  public capture: boolean;
  public passive: boolean;

  constructor(public type?: string, public handler?: EventListener, options?: any) {
    this.capture = Boolean(isObject(options) ? options.capture : options);
    this.passive = Boolean(isObject(options) ? options.passive : false);
  }

  public compare(other: Listener) {
    return (
      this.type === other.type &&
      this.handler === other.handler &&
      this.capture === other.capture &&
      this.passive === other.passive
    );
  }
}

export class ListenerList {
  public listeners: Listener[];
  constructor() {
    this.listeners = [];
  }

  public getAll() {
    return this.listeners;
  }

  public add(listener: Listener) {
    const index = this.findIndex(listener);
    if (index === -1) {
      this.listeners.push(listener);
    }
  }

  public remove(listener: Listener) {
    const index = this.findIndex(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  public findIndex(listener: Listener) {
    return this.listeners.findIndex((item) => listener.compare(item));
  }
}
