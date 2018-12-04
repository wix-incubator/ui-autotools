import fs from 'fs';
import path from 'path';

export const userConfigPath = '.autotools/node-require-hooks.js';

export function registerRequireHooks(projectPath: string) {
  const requirePath = path.join(projectPath, userConfigPath);
  if (fs.existsSync(requirePath)) {
    require(requirePath);
  } else {
    require('@ts-tools/node');
    require('@stylable/node/register');
  }
}
