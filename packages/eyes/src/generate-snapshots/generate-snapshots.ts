import * as path from 'path';
const StylableWebpackPlugin = require('@stylable/webpack-plugin');
const config = require(path.join(process.cwd(), './.autotools/webpack.config.js'));
import * as webpack from 'webpack';
import * as glob from 'glob';
import {HTMLSnapshotPlugin} from '@stylable/webpack-extensions';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {generateFilteringLogic} from './filter-logic';
import {generateMapping} from './generate-mapping';
import Registry, {importMeta, getCompName, IComponentMetadata} from '@ui-autotools/registry';
import {consoleLog} from '@ui-autotools/utils';

importMeta();

const mapping = generateMapping(Registry);
const filteringLogic = generateFilteringLogic(mapping);

const simMatchingRegex = /(?:@sim)([\d]+)/; // Match the prefix "sim", and then match the numbers following it
const fileNameRegex = /(?:.\/.autotools\/)(.+)/; // Match the file name

async function buildSingleFile(file: string, directory: string) {
  const entryName = fileNameRegex.exec(file)![1];
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
        render(compiledFile, sourceFile) {
          let compMetadata: IComponentMetadata<any> | undefined;
          const mapIter = Registry.metadata.components.entries();
          while (!compMetadata) {
            // We only have to do this because we currently map the component definitions to their metadata,
            // not the names. So we have no way to get component metadata by name. And at this point in the build
            // process, the component definition returned by webpack has been modified from the original, so we can't
            // get the metadata with it
            const currentIteration = mapIter.next();
            const currentMetadata = currentIteration.value[1];
            if (getCompName(currentMetadata.component) === compiledFile.default.name) {
              compMetadata = currentMetadata;
            }
            if (currentIteration.done) {
              break;
            }
          }

          if (!compMetadata) {
            throw new Error(`Could not find component metadata for ${compiledFile.default.name}`);
          }

          const simIndex = parseInt(simMatchingRegex.exec(sourceFile.id)![1], 10);
          const props = compMetadata.simulations[simIndex - 1].props;
          const link = `<link rel="stylesheet" type="text/css" href="${entryName}.css">`;
          return link + renderToStaticMarkup(createElement(compiledFile.default.comp, {className: compiledFile.default.style.root, ...props}));
        },
        getLogicModule: filteringLogic
    })
    ]
  };

  const mergedConfig = {...config, ...snapshotConfig};
  const compiler = webpack.default(mergedConfig);

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

export const generateSnapshots = async (directory: string) => {
  const files = glob.sync('./.autotools/**.ts'); // Tool must be run in the root
  consoleLog('Generating snapshots...');
  for (const file of files) {
    await buildSingleFile(file, directory);
  }
};
