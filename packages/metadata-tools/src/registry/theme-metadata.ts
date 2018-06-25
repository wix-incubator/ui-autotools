import { IThemeMetadata } from './types';

export default class ThemeMetadata implements IThemeMetadata {
  public name: string;

  constructor(name: string) {
    this.name = name;
  }
}
