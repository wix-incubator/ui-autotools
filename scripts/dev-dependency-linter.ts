import {readFile} from 'proper-fs';
import glob from 'glob';
import path from 'path';

type ErrorType = 'Error' | 'Warning';

interface IPackageError {
  type: ErrorType;
  packageName: string;
  message: string;
}

export async function devDependencyLinter(pathToPackageJson: string) {
  const errors: IPackageError[] = [];
  let workspaces;

  // Parse the root package.json and retrieve workspaces
  try {
    workspaces = JSON.parse((await readFile(pathToPackageJson)).toString()).workspaces;
  } catch (e) {
    errors.push({type: 'Error', packageName: pathToPackageJson, message: e});
    return errors;
  }

  // Return an error if there aren't any workspaces
  if (!workspaces || workspaces.length === 0) {
    errors.push({type: 'Error', packageName: pathToPackageJson, message: `Couldn't find any valid workspaces.`});
    return errors;
  }

  for (const workspace of workspaces) {
    // Grab the paths to the package.json files in each package of the workspace
    const packages = glob.sync(path.join(workspace, 'package.json'), {ignore: 'node_modules'});

    // If there aren't any, return an error
    if (!packages || packages.length === 0) {
      errors.push({type: 'Error', packageName: workspace, message: `Couldn't find any packages in the workspace.`});
      return errors;
    }

    for (const pkg of packages) {
      const pathToPkg = path.resolve(pkg);
      let devDependencies;

      try {
        devDependencies = JSON.parse((await readFile(pathToPkg)).toString()).devDependencies;
      } catch (e) {
        errors.push({type: 'Error', packageName: pathToPkg, message: e});
        return errors;
      }

      const ignoreIf = '@ui-autotools';
      if (devDependencies) {
        const badDeps = Object.keys(devDependencies).filter((dep) => !dep.startsWith(ignoreIf));
        if (badDeps.length > 0) {
          errors.push({type: 'Error', packageName: pathToPkg, message: `Package "${pkg}" cannot have devDependencies: "${badDeps}" in its package.json. This devDependency should be placed in the root package.json.`});
        }
      }
    }
  }

  return errors;
}
