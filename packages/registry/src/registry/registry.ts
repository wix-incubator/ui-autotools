import {IRegistry} from './types';
import {ComponentType} from 'react';
import {ComponentMetadata} from './component-metadata';
import Metadata from './metadata';
import {getCompName} from '../utils/get-comp-name';
import {getCompId} from '../utils/get-comp-id';
import {isValidComponentName} from '../utils';

const Registry: IRegistry = {
  metadata: new Metadata(),
  getComponentMetadata <Props, State>(comp: ComponentType<Props>): ComponentMetadata<Props, State> {
    const newCompName = getCompName(comp);
    const newCompId = getCompId(comp);

    if (!newCompName || !newCompId) {
      throw new Error('Components must have a "name" property, or a "displayName" property.');
    }

    if (!isValidComponentName(newCompName)) {
      throw new Error('Component names must be alphanumeric.');
    }

    if (!this.metadata.components.has(comp)) {
      for (const component of this.metadata.components.keys()) {
        if (getCompName(component) === newCompName) {
          throw new Error(`There's already a component with the name: "${newCompName}". Component names should be unique.`);
        }
        if (getCompId(component) === newCompId) {
          throw new Error(`There's already a component with the id: "${newCompId}". Component id should be unique.`);
        }
      }

      this.metadata.components.set(comp, new ComponentMetadata<Props, State>(comp));
    }

    return this.metadata.components.get(comp)!;
  },
  clear() {
    this.metadata.components.clear();
  }
};

Object.freeze(Registry);
export default Registry;
