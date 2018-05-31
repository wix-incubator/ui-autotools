import {NodeTypeScriptService} from 'node-typescript-support'
import {sync} from 'glob';
 
const nodeTsService = new NodeTypeScriptService(/* options */)
nodeTsService.installSourceMapSupport() // optional installation of source-map-support
// register our handler for the two default supported extensions
require.extensions['.ts'] = require.extensions['.tsx'] = nodeTsService.requireExtension

const importMeta = (filePattern: string) => {
  const options = {
    nosort: true,
    matchBase: true,
    absolute: true
  };
  const defaultPattern = './**/*.meta.ts[x?]';

  const files = sync(filePattern || defaultPattern, options);

  files.map((file: string) => {
    console.log('Running', file);
    require(file);
  })
}

export default importMeta;