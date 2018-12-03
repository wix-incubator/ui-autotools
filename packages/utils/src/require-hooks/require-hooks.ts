import fs from 'fs';
import path from 'path';

export function registerRequireHooks() {
  const projectPath = process.cwd();
  const requirePath = path.join(projectPath, '.autotools/node-require-hooks.js');
  if (fs.existsSync(requirePath)) {
    require(requirePath);
  } else {
    require('@ts-tools/node');
    require('@stylable/node/register');
  }
}
