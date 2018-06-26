import {IComponentMetadata, IMetadata} from './types';
import {ComponentType} from 'react';

export default class Metadata implements IMetadata {
  public components: Map<ComponentType<any>, IComponentMetadata<any>> = new Map<ComponentType<any>, IComponentMetadata<any>>();
}
