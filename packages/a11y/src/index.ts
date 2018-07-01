/* tslint:disable:no-console */
import path from 'path';
import {WebpackConfigurator} from 'ui-autotools-utils';
import {serve, IServer} from 'ui-autotools-utils';

const packagePath = path.resolve(__dirname, '..');
const projectPath = process.cwd();
const webpackConfigPath = path.join(projectPath, 'meta.webpack.config.js');

function getWebpackConfig() {
  return WebpackConfigurator
    .load(webpackConfigPath)
    .addEntry('meta', path.join(packagePath, 'src/browser/run'))
    .addHtml({
      template: path.join(packagePath, 'src/browser/index.html'),
      title: 'Accessibility'
    })
    .suppressReactDevtoolsSuggestion()
    .getConfig();
}

async function main() {
  let server: IServer | null = null;
  try {
    server = await serve({webpackConfig: getWebpackConfig()});
    const numFailedTests = await runTests(server.getUrl());
    process.exitCode = numFailedTests ? 1 : 0;
  } catch (error) {
    process.exitCode = 1;
    console.error(error ? error.message : '');
  } finally {
    // if (server) {
    //   server.close();
    // }
    // process.exit();
  }
}

async function runTests(url: string) {
  console.log(`Serving meta bundle on ${url}`);
  return 0;
}

main();
