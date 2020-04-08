import { ComponentType } from 'react';

export function getCompName(comp: ComponentType<any>): string {
  // Should return displayName first, as if it's set, it means that it was set explicitly
  // (we get "name" by default)
  return comp.displayName || comp.name || '';
}
