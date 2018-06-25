import {IComponentMetadata, IStyleMetadata, IMetadata, IAssetMetadata} from './types';
import {ComponentType} from 'react';

export default class Metadata implements IMetadata {
  public components: Map<ComponentType<any>, IComponentMetadata<any>> = new Map<ComponentType<any>, IComponentMetadata<any>>();
  public assets: Map<any, IAssetMetadata> = new Map<any, IAssetMetadata>();
  public themes: Map<any, IStyleMetadata> = new Map<any, IStyleMetadata>();
}
