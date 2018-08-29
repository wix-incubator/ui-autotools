import 'typescript-support';
import * as glob from 'glob';
import {registerRequireHooks} from '@ui-autotools/utils';

registerRequireHooks();

const importMeta = (filePattern?: string) => {
  const options = {
    nosort: true,
    matchBase: true,
    absolute: true,
  };
  const defaultPattern = './**/*.meta.ts[x?]';

  const files = glob.sync(filePattern || defaultPattern, options);

  files.map((file: string) => {
    require(file);
  });
};

export {importMeta};
