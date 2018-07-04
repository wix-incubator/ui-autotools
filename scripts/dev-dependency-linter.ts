import {readFile} from 'proper-fs';
import glob from 'glob';
import path from 'path';

type ErrorType = 'Error' | 'Warning';

interface IPackageError {
  type: ErrorType;
  packageName: string;
  message: string;
}

class PackageError implements IPackageError {
  constructor(public type: ErrorType, public packageName: string, public message: string) {}
}

export async function devDependencyLinter(pathToPackageJson: string) {
  const errors: PackageError[] = [];
  let workspaces;

  // Parse the root package.json and retrieve workspaces
  try {
    workspaces = JSON.parse((await readFile(pathToPackageJson)).toString()).workspaces;
  } catch (e) {
    errors.push(new PackageError('Error', pathToPackageJson, e));
    return errors;
  }

  // Return an error if there aren't any workspaces
  if (!workspaces || workspaces.length === 0) {
    errors.push(new PackageError('Error', pathToPackageJson, `Couldn't find any valid workspaces.`));
    return errors;
  }

  for (const workspace of workspaces) {
    // Grab the paths to the package.json files in each package of the workspace
    const packages = glob.sync(path.join(workspace, 'package.json'), {ignore: 'node_modules'});

    // If there aren't any, return an error
    if (!packages || packages.length === 0) {
      errors.push(new PackageError('Error', workspace, `Couldn't find any packages in the workspace.`));
      return errors;
    }

    for (const pkg of packages) {
      const pathToPkg = path.resolve(pkg);
      let devDependencies;

      try {
        devDependencies = JSON.parse((await readFile(pathToPkg)).toString()).devDependencies;
      } catch (e) {
        errors.push(new PackageError('Error', pathToPkg, e));
        return errors;
      }

      if (devDependencies) {
        errors.push(new PackageError('Error', pathToPkg, `Package "${pkg}" cannot have devDependencies: "${Object.keys(devDependencies)}" in its package.json. This devDependency should be placed in the root package.json.`));
      }
    }
  }

  return errors;
}
