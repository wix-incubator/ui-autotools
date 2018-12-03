import fs from 'fs';
import path from 'path';

export function registerRequireHooks() {
  const projectPath = process.cwd();
  const path1 = path.join(projectPath, '.autotools/node-require-hooks');
  if (fs.existsSync(path1 + '.js')) {
    require(path1);
  } else {
    require('@ts-tools/node');
    require('@stylable/node/register');
  }
}
