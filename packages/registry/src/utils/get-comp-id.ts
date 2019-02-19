import {ComponentType} from 'react';

/** Get a unique string identifier for a component */
export function getCompId(comp: ComponentType<any>): string {
  // Should return displayName first, since if it's set, it means that it was set explicitly
  // (we get "name" by default)
  return comp.displayName || comp.name || '';
}
