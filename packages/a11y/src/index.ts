/* tslint:disable:no-console */
import path from 'path';
import puppeteer from 'puppeteer';
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
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', async (msg) => {
      const args = await Promise.all(msg.args().map((a) => a.jsonValue()));
      console.log(...args);
      if (server) {
        server.close();
      }
      process.exit();
    });
    await page.goto(server.getUrl());
    // await browser.close();
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

main();
