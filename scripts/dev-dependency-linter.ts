const fs = require('fs');
const glob = require('glob');

export const devDependencyLinter = (pathToPackageJson: string): string[] => {
  const errors = [];
  const {workspaces} = JSON.parse(fs.readFileSync(pathToPackageJson));

  for (const workspace of workspaces) {
    const packages = glob.sync(workspace);
    if (!packages || packages.length === 0) {
      errors.push(`Couldn't find any packages in the workspace.`);
      return errors;
    }

    for (const pkg of packages) {
      const {devDependencies} = JSON.parse(fs.readFileSync(`${pkg}/package.json`));

      if (devDependencies) {
        for (const devDependency of Object.keys(devDependencies)) {
          errors.push(`Package "${pkg}" cannot have devDependency "${devDependency}" in its package.json. This dev-dependency should be placed in the root package.json`);
        }
      }
    }
  }

  return errors;
};
