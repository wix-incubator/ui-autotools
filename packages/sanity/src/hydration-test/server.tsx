import path from 'path';
import glob from 'glob';
import {WebpackConfigurator, runTestsInPuppeteer, serve, IServer} from '@ui-autotools/utils';
import {renderMetadata} from './render-metadata';

const packageDir = path.resolve(__dirname, '..');

function getWebpackConfig(ssrComps: string[], metaGlob: string, webpackConfigPath: string) {
  return WebpackConfigurator
    .load(webpackConfigPath)
    .setEntry('meta', glob.sync(metaGlob))
    .addEntry('meta', path.join(packageDir, 'hydration-test', 'test-page.js'))
    .addEntry('meta', path.join(packageDir, 'hydration-test', 'index.js'))
    .addHtml({
      template: path.join(packageDir, '../templates/', 'test-page.template'),
      components: JSON.stringify(ssrComps)
    })
    .suppressReactDevtoolsSuggestion()
    .getConfig();
}

export async function hydrationTest(metaGlob: string, webpackConfigPath: string) {
  let server: IServer | null = null;
  try {
    const ssrComps = renderMetadata();
    server = await serve({webpackConfig: getWebpackConfig(ssrComps, metaGlob, webpackConfigPath)});
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
