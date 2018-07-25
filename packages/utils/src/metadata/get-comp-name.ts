export function getCompName(comp: React.ComponentType<any>) {
  return comp.name || comp.displayName;
}
