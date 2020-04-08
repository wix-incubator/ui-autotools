import path from 'path';
import glob from 'glob';
import { WebpackConfigurator, runTestsInPuppeteer, serve, IServer } from '@ui-autotools/utils';
import { renderMetadata } from './render-metadata';

const packageDir = path.resolve(__dirname, '..');

function getWebpackConfig(projectPath: string, metaGlob: string, webpackConfigPath: string, ssrComps: string[]) {
  return WebpackConfigurator.load(webpackConfigPath)
    .setEntry('meta', glob.sync(metaGlob, { absolute: true, cwd: projectPath }))
    .addEntry('meta', path.join(packageDir, 'hydration-test', 'test-page.js'))
    .addEntry('meta', path.join(packageDir, 'hydration-test', 'index.js'))
    .addHtml({
      template: path.join(packageDir, '../templates/', 'test-page.template'),
      components: JSON.stringify(ssrComps),
    })
    .suppressReactDevtoolsSuggestion()
    .getConfig();
}

export async function hydrationTest(projectPath: string, metaGlob: string, webpackConfigPath: string) {
  let server: IServer | null = null;
  try {
    const ssrComps = renderMetadata();
    server = await serve({
      webpackConfig: getWebpackConfig(projectPath, metaGlob, webpackConfigPath, ssrComps),
    });
    const numFailedTests = await runTestsInPuppeteer({
      testPageUrl: server.getUrl(),
    });
    if (numFailedTests) {
      process.exitCode = 1;
    }
  } catch (error) {
    process.exitCode = 1;
    if (error) {
      process.stderr.write(error.toString() + '\n');
    }
  } finally {
    if (server) {
      server.close();
    }
    process.exit();
  }
}
