/* tslint:disable:no-console */

import path from 'path';
import {WebpackConfigurator} from 'ui-autotools-utils';
import {serve, IServer} from 'ui-autotools-utils';
import puppeteer from 'puppeteer';

const packagePath = path.resolve(__dirname, '../..');
const projectPath = process.cwd();
const webpackConfigPath = path.join(projectPath, 'meta.webpack.config.js');

function getWebpackConfig() {
  return WebpackConfigurator
    .load(webpackConfigPath)
    .addEntry('meta', path.join(packagePath, 'src/ssr-renderer/browser/run'))
    .addHtml({
      template: path.join(packagePath, 'src/ssr-renderer/browser/index.html'),
      title: 'SSR-Hydrate'
    })
    .suppressReactDevtoolsSuggestion()
    .getConfig();
}

async function main() {
  let server: IServer | null = null;
  try {
    server = await serve({webpackConfig: getWebpackConfig()});
    const browser = await puppeteer.launch({headless: false, devtools: true});
    const page = await browser.newPage();
    // tslint:disable-next-line:no-debugger
    await page.evaluate(() => {debugger;});
    // page.on('console', async (msg) => {
    //   const args = await Promise.all(msg.args().map((a) => a.jsonValue()));
    //   console.log(...args);
    //   if (server) {
    //     server.close();
    //   }
    //   process.exit();
    // });
    await page.goto(server.getUrl());
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

// async function runTests(url: string) {
//   console.log(`Serving meta bundle on ${url}`);
//   return 0;
// }

main();
