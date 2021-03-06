import fs from 'fs';
import path from 'path';

export const userConfigPath = '.autotools/node-require-hooks.js';

export function registerRequireHooks(projectPath: string): void {
  const requirePath = path.join(projectPath, userConfigPath);
  if (fs.existsSync(requirePath)) {
    require(requirePath);
  } else {
    require('@ts-tools/node/r');
    require('@stylable/node/register');
  }
}
