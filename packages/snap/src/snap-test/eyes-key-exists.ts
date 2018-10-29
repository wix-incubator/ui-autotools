import {consoleError} from '@ui-autotools/utils';

export function eyesKeyExists(skipOnMissingKey: boolean): boolean {
  if (!process.env.APPLITOOLS_API_KEY && !process.env.EYES_API_KEY) {
    if (!skipOnMissingKey) {
      throw new Error('The environment variable "APPLITOOLS_API_KEY" needs to be defined.');
    }
    return false;
  }

  if (!process.env.APPLITOOLS_API_KEY) {
    consoleError('Warning: falling back to using process.env.EYES_API_KEY, please set process.env.APPLITOOLS_API_KEY instead.');
  }

  return true;
}
