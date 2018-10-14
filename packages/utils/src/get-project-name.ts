import path from 'path';

export function getProjectName(projectPath: string): string {
  const packageJsonPath = path.join(projectPath, 'package.json');
  try {
    const name = require(packageJsonPath).name;
    if (name && typeof name === 'string') {
      return name;
    }
  } catch (e) {
    // fallthrough
  }

  throw new Error(`The project must have a package.json file with a "name" field in ${packageJsonPath}.`);
}
