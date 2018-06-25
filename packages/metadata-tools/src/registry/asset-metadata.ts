import { IAssetMetadata } from './types';

export default class AssetMetadata implements IAssetMetadata {
  public type: string;
  public name: string;
  public description: string | undefined;

  constructor(type: string, name: string, description?: string) {
    this.type = type;
    this.name = name;
    this.description = description;
  }
}
