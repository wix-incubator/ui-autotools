const StylableWebpackPlugin = require('@stylable/webpack-plugin');
import path from 'path';
import webpack from 'webpack';
import React from 'react';
import {HTMLSnapshotPlugin} from '@stylable/webpack-extensions';
import {renderToStaticMarkup} from 'react-dom/server';
import {consoleWarn} from '@ui-autotools/utils';
import { ISimSnapInfo, createHtml } from '../..';

export interface IFileInfo {
  basename: string;
  filepath: string;
}

export function render(fileName: string, snapInfo: ISimSnapInfo, returnHtml: (html: string) => void, compiledFile: any, _sourceFile: any) {
  const compMetadata = snapInfo.componentMetadata;

  if (!compMetadata) {
    throw new Error(`Could not find component metadata for ${compiledFile.default.name}`);
  }

  if (!compMetadata.exportInfo) {
    throw new Error(`Cannot generate snapshot for "${compiledFile.default.name}" without exportInfo in its metadata.`);
  }

  const Comp = compMetadata.simulationToJSX(snapInfo.simulation);
  const styledElement = React.cloneElement(Comp, {className: compiledFile.default.style.root});
  const cssLink = `<link rel="stylesheet" type="text/css" href="${fileName}.css">`;
  const componentString = renderToStaticMarkup(styledElement);

  const html = createHtml(componentString, [cssLink], compMetadata.exportInfo.exportName);

  returnHtml(html);
  return ''; // Must return a string, but we don't actually use the HTML snapshot file in the end
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

async function buildSingleFile(fileName: string, filePath: string, directory: string, config: any, snapInfo: ISimSnapInfo, returnHtml: (html: string) => void) {
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
        render: render.bind(null, fileName, snapInfo, returnHtml),
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
      if (stats && stats.hasErrors()) {
        throw new Error(stats.toString());
      } else if (stats && stats.hasWarnings()) {
        consoleWarn(stats.toString());
      }
    });
  });
}

export const generateSnapshots = async (projectDir: string, tempDirectory: string, files: IFileInfo[], snapInfo: ISimSnapInfo, returnHtml: (html: string) => void) => {
  const webpackConfig = require(path.join(projectDir, '.autotools/webpack.config.js'));

  for (const file of files) {
    await buildSingleFile(file.basename, file.filepath, tempDirectory, webpackConfig, snapInfo, returnHtml);
  }
};
