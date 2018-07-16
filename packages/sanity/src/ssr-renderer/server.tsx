import 'typescript-support';
import path from 'path';
import glob from 'glob';
import {WebpackConfigurator, runTestsInPuppeteer, serve, IServer} from 'ui-autotools-utils';
import {renderMetadata} from './import-and-render';

const packageDir = path.resolve(__dirname, '..');
const projectDir = process.cwd();
const metaGlob = 'src/**/*.meta.ts?(x)';
const webpackConfigPath = path.join(projectDir, 'meta.webpack.config.js');

function getWebpackConfig(ssrComps: string[]) {
  return WebpackConfigurator
    .load(webpackConfigPath)
    .setEntry('meta', glob.sync(path.join(projectDir, metaGlob)))
    .addEntry('meta', path.join(packageDir, 'ssr-renderer', 'test-page.js'))
    .addEntry('meta', path.join(packageDir, 'ssr-test', 'index.js'))
    .addHtml({
      template: path.join(packageDir, '../src/ssr-renderer', 'test-page.html'),
      components: JSON.stringify(ssrComps)
    })
    .suppressReactDevtoolsSuggestion()
    .getConfig();
}

export async function sanityTest() {
  let server: IServer | null = null;
  try {
    const ssrComps = renderMetadata();
    server = await serve({webpackConfig: getWebpackConfig(ssrComps)});
    const numFailedTests = await runTestsInPuppeteer({testPageUrl: server.getUrl()});
    if (numFailedTests) {
      process.exitCode = 1;
    }
  } catch (error) {
    process.exitCode = 1;
    if (error) {
      process.stderr.write(error.toString());
    }
  } finally {
    if (server) {
      server.close();
    }
    process.exit();
  }
}
