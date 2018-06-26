import { IAssetMetadata } from './types';

export class AssetMetadata implements IAssetMetadata {
  constructor(public type: string, public name: string, public description?: string) {}
}
