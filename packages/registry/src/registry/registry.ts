import {IRegistry} from './types';
import {ComponentType} from 'react';
import {ComponentMetadata} from './component-metadata';
import Metadata from './metadata';

const Registry: IRegistry = {
  metadata: new Metadata(),
  getComponentMetadata <Props>(comp: ComponentType<Props>): ComponentMetadata<Props> {
    if (!comp.name || !comp.displayName) {
      throw new Error('Components must have either a "name" property, or a "displayName" property.');
    }

    if (!this.metadata.components.has(comp)) {
      this.metadata.components.set(comp, new ComponentMetadata<Props>());
    }

    return this.metadata.components.get(comp)!;
  },
  clear() {
    this.metadata.components.clear();
  }
};

Object.freeze(Registry);
export default Registry;
