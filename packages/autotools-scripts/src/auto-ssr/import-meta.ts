import * as path from 'path';
import * as fs from 'fs';
import { NodeTypeScriptService } from 'node-typescript-support'
 
const nodeTsService = new NodeTypeScriptService(/* options */)
nodeTsService.installSourceMapSupport() // optional installation of source-map-support
 
// register our handler for the two default supported extensions
require.extensions['.ts'] = require.extensions['.tsx'] = nodeTsService.requireExtension

const rootPath = process.cwd();

const importMeta = () => {
  fromDir(rootPath ,/[.]meta/, function(filename: string){
    console.log(filename);
    require(filename);
  });
}

function fromDir(startPath: string, filter: RegExp, callback: Function){
  if (!fs.existsSync(startPath)){
      console.log("no dir ",startPath);
      return;
  }

  const files = fs.readdirSync(startPath);
  const goodFiles = files.filter((file) => {
    return file !== 'node_modules' && 
            file !== 'dist' && 
            file !== 'bin' &&
            file !== 'cjs' &&
            file !== 'esm' &&
            file !== '.git';
  });


  
  for(var i=0;i<goodFiles.length;i++){
      var filename=path.join(startPath,goodFiles[i]);
      var stat = fs.lstatSync(filename);
      if (stat.isDirectory()){
          fromDir(filename,filter,callback); //recurse
      }
      else if (filter.test(filename)) callback(filename);
      // else if (true) callback(filename);
  };
};

export default importMeta;