const StylableWebpackPlugin = require('@stylable/webpack-plugin');
import path from 'path';
import webpack from 'webpack';
import glob from 'glob';
import {HTMLSnapshotPlugin} from '@stylable/webpack-extensions';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {generateFilteringLogic} from './filter-logic';
import {mapSylesToComponents} from './map-styles-to-components';
import Registry, {importMeta, getCompName, IComponentMetadata} from '@ui-autotools/registry';
import {consoleLog} from '@ui-autotools/utils';
import {dedent} from './dedent';
import {parseSnapshotFilename} from './filename-utils';

const fileNameRegex = /(?:.\/.autotools\/tmp\/)(.+)/; // Match the file name

async function buildSingleFile(file: string, directory: string, filteringLogic: (stylableModule: any) => any, config: any) {
  const entryName = file.match(fileNameRegex)![1];

  function render(compiledFile: any, sourceFile: any) {
    let compMetadata: IComponentMetadata<any> | undefined;

    // We only have to do this because we currently map the component definitions to their metadata,
    // not the names. So we have no way to get component metadata by name. And at this point in the build
    // process, the component definition returned by webpack has been modified from the original, so we can't
    // get the metadata with it
    for (const component of Registry.metadata.components) {
      const metadata = component[1];
      if (getCompName(metadata.component) === compiledFile.default.name) {
        compMetadata = metadata;
        break;
      }
    }

    if (!compMetadata) {
      throw new Error(`Could not find component metadata for ${compiledFile.default.name}`);
    }

    const {simIndex} = parseSnapshotFilename(sourceFile.id, '.ts');
    const props = compMetadata.simulations[simIndex].props;
    const cssLink = `<link rel="stylesheet" type="text/css" href="${entryName}.css">`;
    const componentString = renderToStaticMarkup(createElement(compiledFile.default.comp, {className: compiledFile.default.style.root, ...props}));
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

  const snapshotConfig = {
    entry: {
      [entryName]: file
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
        render,
        getLogicModule: filteringLogic
    })
    ]
  };

  const mergedConfig = {...config, ...snapshotConfig};
  const compiler = webpack(mergedConfig);

  return new Promise((resolve, reject) => {
    compiler.run((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export const generateSnapshots = async (processDir: string, directory: string) => {
  importMeta();
  const config = require(path.join(processDir, './.autotools/webpack.config.js'));
  const mapping = mapSylesToComponents(Registry, processDir);
  const filteringLogic = generateFilteringLogic(mapping);
  const files = glob.sync('./.autotools/tmp/**.ts', {cwd: processDir}); // Tool must be run in the root

  consoleLog('Generating snapshots...');
  for (const file of files) {
    await buildSingleFile(file, directory, filteringLogic, config);
  }
};
