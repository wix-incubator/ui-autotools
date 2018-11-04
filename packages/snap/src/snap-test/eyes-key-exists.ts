import {consoleError} from '@ui-autotools/utils';

export function eyesKeyExists(): boolean {
  if (!process.env.APPLITOOLS_API_KEY && !process.env.EYES_API_KEY) {
    return false;
  }

  if (!process.env.APPLITOOLS_API_KEY) {
    consoleError('Warning: falling back to using process.env.EYES_API_KEY, please set process.env.APPLITOOLS_API_KEY instead.');
  }

  return true;
}
