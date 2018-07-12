import 'typescript-support';
import React from 'react';
import path from 'path';
import glob from 'glob';
import {renderToString} from 'react-dom/server';
import {WebpackConfigurator, serve} from 'ui-autotools-utils';
import Registry from 'metadata-tools';

const packageDir = path.resolve(__dirname, '..');
const projectDir = process.cwd();
const metaGlob = 'src/**/*.meta.ts?(x)';
const webpackConfigPath = path.join(projectDir, 'meta.webpack.config.js');

// Don't use 'localhost' because it can either mean IPv4 or IPv6 address. If
// something is listening on the same port on ::1, then `testPageUrl` will be
// ambiguous, and the browser will default to IPv6, and load the wrong page.
// const host = '127.0.0.1';
const port = 7357;
// const testPageUrl = `http://${host}:${port}`;

const importMetadata = (filePattern: any) => {
  const options = {
    nosort: true,
    matchBase: true,
    absolute: true,
  };
  const defaultPattern = './**/*.meta.ts[x?]';

  const files = glob.sync(filePattern || defaultPattern, options);

  files.map((file: any) => {
    require(file);
  });
};

importMetadata(path.join(projectDir, metaGlob));

const myComp: any = [];
Registry.metadata.components.forEach((metadata, Comp) => {
  metadata.simulations.forEach(((simulation) => {
    if (Comp.name !== 'Modal') {
      const jsx = ( <Comp {...simulation.props} /> );
      myComp.push(renderToString(jsx));
    }
  }));
});

function getWebpackConfig() {
  return WebpackConfigurator
    .load(webpackConfigPath)
    .setEntry('meta', glob.sync(path.join(projectDir, metaGlob)))
    .addEntry('meta', path.join(packageDir, 'ssr-renderer', 'test-page.js'))
    .addEntry('meta', path.join(packageDir, 'ssr-test', 'index.js'))
    .addHtml({
      template: path.join(packageDir, '../src/ssr-renderer', 'test-page.html'),
      title: JSON.stringify(myComp)
    })
    .suppressReactDevtoolsSuggestion()
    .getConfig();
}

async function runInWatchMode() {
  try {
    await serve({webpackConfig: getWebpackConfig(), watch: true, port});
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.error(error);
    process.exit(1);
  }
}

runInWatchMode();
