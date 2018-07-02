const fs = require('fs');
const glob = require('glob');

let rootPackageJson;

try {
  rootPackageJson = JSON.parse(fs.readFileSync('./package.json'));
} catch (e) {
  throw new Error(`Failed to parse package.json, with error: ${e}`);
}

let workspaces;

if (rootPackageJson.workspaces) {
  workspaces = rootPackageJson.workspaces;
} else {
  throw new Error('It seems like the root package.json doesn\'t define a workspace.');
}


for (const workspace in workspaces) {
  const packages = glob.sync(workspace);
  if (!packages || packages.length === 0) {
    throw new Error('Couldn\'t find any packages in the workspace.');
  }
  const errors = [];

  for (const package in packages) {
    const packageJson = JSON.parse(fs.readFileSync(`${package}/package.json`));
    if (packageJson.devDependencies) {
      for (const devDep in packageJson.devDependencies) {
        errors.push(`\n Package "${package}" cannot have devDependency "${devDep}" in its package.json. This dev-dependency should be placed in the root package.json`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
};
