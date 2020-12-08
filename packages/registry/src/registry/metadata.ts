import type React from 'react';
import type { IComponentMetadata, IMetadata } from './types';

export default class Metadata implements IMetadata {
  public components: Map<React.ComponentType<any>, IComponentMetadata<any, any>> = new Map<
    React.ComponentType<any>,
    IComponentMetadata<any, any>
  >();
}
