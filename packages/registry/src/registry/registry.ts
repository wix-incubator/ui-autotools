import {IRegistry} from './types';
import {ComponentType} from 'react';
import {ComponentMetadata} from './component-metadata';
import Metadata from './metadata';
import {getCompName} from '../utils/get-comp-name';

const Registry: IRegistry = {
  metadata: new Metadata(),
  getComponentMetadata <Props>(comp: ComponentType<Props>): ComponentMetadata<Props> {
    const newCompName = getCompName(comp);

    if (!newCompName) {
      throw new Error('Components must have a "name" property, or a "displayName" property.');
    }

    if (!this.metadata.components.has(comp)) {
      for (const component of this.metadata.components.keys()) {
        if (getCompName(component) === newCompName) {
          throw new Error(`There's already a component with the name: "${newCompName}". Component names should be unique.`);
        }
      }

      this.metadata.components.set(comp, new ComponentMetadata<Props>(comp));
    }

    return this.metadata.components.get(comp)!;
  },
  clear() {
    this.metadata.components.clear();
  }
};

Object.freeze(Registry);
export default Registry;
