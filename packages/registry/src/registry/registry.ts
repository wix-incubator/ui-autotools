import {IRegistry} from './types';
import {ComponentType} from 'react';
import {ComponentMetadata} from './component-metadata';
import Metadata from './metadata';
import {getCompName} from '../utils/get-comp-name';

const Registry: IRegistry = {
  metadata: new Metadata(),
  getComponentMetadata <Props>(comp: ComponentType<Props>): ComponentMetadata<Props> {
    if (!getCompName(comp)) {
      throw new Error('Components must have either a "name" property, or a "displayName" property.');
    }

    if (!this.metadata.components.has(comp)) {
      const newCompName = getCompName(comp);

      for (const component of this.metadata.components.keys()) {
        if (getCompName(component) === newCompName) {
          throw new Error(`There already exists a component with the name: "${newCompName}". Component names must be unique.`);
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
