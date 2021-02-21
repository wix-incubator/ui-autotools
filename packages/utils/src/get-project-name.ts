import path from 'path';

export function getProjectName(projectPath: string): string {
  const packageJsonPath = path.join(projectPath, 'package.json');
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const name = (require(packageJsonPath) as { name?: string }).name;
    if (name && typeof name === 'string') {
      return name;
    }
  } catch (e) {
    // fallthrough
  }

  throw new Error(`The project must have a package.json file with a "name" field in ${packageJsonPath}.`);
}
