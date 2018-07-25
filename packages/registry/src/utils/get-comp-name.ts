import {ComponentType} from 'React';

export function getCompName(comp: ComponentType<any>) {
  // Should return displayName first, as if it's set, it means that it was set explicitly
  // (we get "name" by default)
  return comp.displayName || comp.name;
}
