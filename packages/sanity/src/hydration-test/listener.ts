function isObject(val: unknown): val is object {
  return !!val && typeof val === 'object';
}

export class Listener {
  public capture: boolean;
  public passive: boolean;

  constructor(public type?: string, public handler?: EventListener, options?: AddEventListenerOptions) {
    this.capture = Boolean(isObject(options) ? options.capture : options);
    this.passive = Boolean(isObject(options) ? options.passive : false);
  }

  public compare(other: Listener): boolean {
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

  public getAll(): Listener[] {
    return this.listeners;
  }

  public add(listener: Listener): void {
    const index = this.findIndex(listener);
    if (index === -1) {
      this.listeners.push(listener);
    }
  }

  public remove(listener: Listener): void {
    const index = this.findIndex(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  public findIndex(listener: Listener): number {
    return this.listeners.findIndex((item) => listener.compare(item));
  }
}
