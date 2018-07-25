import {ComponentType} from 'React';

export function getCompName(comp: ComponentType<any>) {
  return comp.name || comp.displayName;
}
