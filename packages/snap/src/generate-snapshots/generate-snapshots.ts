const StylableWebpackPlugin = require('@stylable/webpack-plugin');
import path from 'path';
import webpack from 'webpack';
import React from 'react';
import {HTMLSnapshotPlugin} from '@stylable/webpack-extensions';
import {renderToStaticMarkup} from 'react-dom/server';
import {getCompName, IComponentMetadata, IRegistry} from '@ui-autotools/registry';
import {consoleLog, consoleWarn} from '@ui-autotools/utils';
import {dedent} from './dedent';
import {parseSnapshotFilename} from './filename-utils';
import { IFileInfo } from './build-base-files';
import {generateSnapshotFilename} from './filename-utils';
import {writeDataToFs} from './write-data-to-fs';

function findComponentByName(name: string, Registry: IRegistry): IComponentMetadata<any, any> | void {
    // We only have to do this because we currently map the component definitions to their metadata,
    // not the names. So we have no way to get component metadata by name. And at this point in the build
    // process, the component definition returned by webpack has been modified from the original, so we can't
    // get the metadata with it
  for (const component of Registry.metadata.components) {
    const metadata = component[1];
    if (getCompName(metadata.component) === name) {
      return metadata;
    }
  }
}

export function render(fileName: string, Registry: IRegistry, compiledFile: any, sourceFile: any) {
  const compMetadata = findComponentByName(compiledFile.default.name, Registry);

  if (!compMetadata) {
    throw new Error(`Could not find component metadata for ${compiledFile.default.name}`);
  }

  const {simIndex} = parseSnapshotFilename(sourceFile.id);
  const Comp = compMetadata.simulationToJSX(compMetadata.simulations[simIndex]);
  const styledElement = React.cloneElement(Comp, {className: compiledFile.default.style.root});
  const cssLink = `<link rel="stylesheet" type="text/css" href="${fileName}.css">`;
  const componentString = renderToStaticMarkup(styledElement);

  const template = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${compMetadata.exportName}</title>
    ${cssLink}
  </head>
  <body>
    ${componentString}
  </body>
  </html>`;
  return dedent(template);
}

/**
 * This method is used by the HTMLSnapshotPlugin to determine which component logic file to link to a specific style
 * sheet. In this case, we don't want to build the component.tsx file associated with a certain style - we want to
 * build the auto-generated files in the .autotools/tmp folder. By default, the HTMLSnapshotPlugin will only
 * build files that have the same name as the associated stylesheet, hence the custom logic.
 */
export function filterLogicModule(stylableModule: any) {
  const views = stylableModule.reasons
    .filter(({ module: _module }: {module: any}) => {
        const isProperModule = _module &&
        _module.type !== 'stylable' &&
        _module.resource &&
        _module.resource.endsWith('.snapshot.ts');
        // We don't want to return the base component logic, we want to return the generated file which
        // imports the original comp and its style variant

        return isProperModule;
    })
    .map(({module}: {module: any}) => {
        return module;
    });

  const set = new Set(views);
  if (set.size > 1) {
      throw new Error(
          `Stylable Component Conflict:\n ${
              stylableModule.resource
          } has multiple components entries [${Array.from(set)}] `
      );
  }
  return views[0];
}

async function buildSingleFile(fileName: string, filePath: string, directory: string, config: any, Registry: IRegistry) {
  const snapshotConfig = {
    entry: {
      [fileName]: filePath
    },
    target: 'node',
    output: {
      filename: '[name].js',
      pathinfo: true,
      path: directory
    },
    plugins: [
      new StylableWebpackPlugin({
        outputCSS: true,
        path: directory,
        filename: '[name].css'
      }),
      new HTMLSnapshotPlugin({
        render: render.bind(null, fileName, Registry),
        getLogicModule: filterLogicModule
    })
    ]
  };

  // TODO: should use the project's Stylable, instead of replacing it with our own Stylable plugin version
  const mergedConfig = {...config, ...snapshotConfig};
  const compiler = webpack(mergedConfig);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
      if (stats.hasErrors()) {
        throw new Error(stats.toString());
      } else if (stats.hasWarnings()) {
        consoleWarn(stats.toString());
      }
    });
  });
}

export const generateSnapshots = async (projectDir: string, tempDirectory: string, Registry: IRegistry, files: IFileInfo[]) => {
  const webpackConfig = require(path.join(projectDir, '.autotools/webpack.config.js'));

  consoleLog('Generating snapshots...');
  for (const file of files) {
    await buildSingleFile(file.basename, file.filepath, tempDirectory, webpackConfig, Registry);
  }
};

export interface IFileInfo {
  basename: string;
  filepath: string;
  data: string;
}

export const generateSnapshots2 = async (projectDir: string, tempDirectory: string, Registry: IRegistry) => {
  const files: IFileInfo[] = [];
  consoleLog('Generating snapshots...');
  Registry.metadata.components.forEach((componentMetadata) => {
    const simIndex = componentMetadata.simulations.length;
    const compName = componentMetadata.exportName;

    if (compName) {
      for (let i = 0; i < simIndex; i++) {
        const simulationName = componentMetadata.simulations[i].title;
        const basename = generateSnapshotFilename(compName, simulationName, i);
        const filepath = path.join(tempDirectory, basename + '.snapshot.ts');
        const data = createHtml(projectDir, componentMetadata, componentMetadata.simulations[i].props);
        files.push({basename, filepath, data});
      }
    }
  });

  writeDataToFs(files);
  return files;
};

const createHtml = (projectDir: string, compMetadata: IComponentMetadata<any, any>, props: any) => {
  if (!compMetadata.compPath) {
    throw new Error(`Component ${compMetadata.exportName} has no path`);
  }
  const comp = require(path.join(projectDir, compMetadata.compPath)).default;
  const cssLink = compMetadata.cssPath ? `<link rel="stylesheet" type="text/css" href="${path.join(projectDir, compMetadata.cssPath)}.css">` : '';
  const componentString = renderToStaticMarkup(React.createElement(comp, props));

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${compMetadata.exportName}</title>
    ${cssLink}
  </head>
  <body>
    ${componentString}
  </body>
  </html>`;
};
