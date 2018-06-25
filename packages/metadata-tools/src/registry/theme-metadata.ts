import { IThemeMetadata } from './types';

export default class ThemeMetadata implements IThemeMetadata {
  constructor(public name: string) {}
}
