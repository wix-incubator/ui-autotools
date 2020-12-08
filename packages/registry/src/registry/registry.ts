import type React from 'react';
import type { IRegistry } from './types';
import { ComponentMetadata } from './component-metadata';
import Metadata from './metadata';
import { getCompName } from '../utils/get-comp-name';
import { isValidComponentName } from '../utils';

const Registry: IRegistry = {
  metadata: new Metadata(),
  getComponentMetadata<Props, State>(comp: React.ComponentType<Props>): ComponentMetadata<Props, State> {
    const newCompName = getCompName(comp);

    if (!newCompName) {
      throw new Error('Components must have a "name" property, or a "displayName" property.');
    }

    if (!isValidComponentName(newCompName)) {
      throw new Error('Component names (displayName | name) are allowed to have only alphanumeric characters or dots.');
    }

    if (!this.metadata.components.has(comp)) {
      for (const component of this.metadata.components.keys()) {
        if (getCompName(component) === newCompName) {
          throw new Error(
            `There's already a component with the name: "${newCompName}". Component names should be unique.`
          );
        }
      }

      this.metadata.components.set(comp, new ComponentMetadata<Props, State>(comp));
    }

    return this.metadata.components.get(comp)!;
  },
  clear() {
    this.metadata.components.clear();
  },
};

Object.freeze(Registry);
export default Registry;
