import 'typescript-support';
import * as glob from 'glob';
import {registerRequireHooks} from '@ui-autotools/utils';

registerRequireHooks();

const importMeta = (filePattern?: string, basepath?: string) => {
  const options: glob.IOptions = {
    nosort: true,
    matchBase: true,
    absolute: true
  };

  if (basepath) {
    options.cwd = basepath;
  }

  const defaultPattern = './**/*.meta.ts[x?]';

  const files = glob.sync(filePattern || defaultPattern, options);

  files.map((file: string) => {
    require(file);
  });
};

export {importMeta};
