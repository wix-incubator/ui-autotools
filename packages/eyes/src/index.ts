/* tslint:disable:no-console */

import path from 'path';
import puppeteer from 'puppeteer';
import {WebpackConfigurator, serve, IServer, waitForPageError} from 'ui-autotools-utils';

const packagePath = path.resolve(__dirname, '..');
const projectPath = process.cwd();
const webpackConfigPath = path.join(projectPath, 'meta.webpack.config.js');

function getWebpackConfig() {
  return WebpackConfigurator
    .load(webpackConfigPath)
    .addEntry('meta', path.join(packagePath, 'src/browser/run'))
    .addHtml({
      template: path.join(packagePath, 'src/browser/index.html'),
      title: 'Eyes'
    })
    .suppressReactDevtoolsSuggestion()
    .getConfig();
}

async function runTests(url: string) {
  const viewportWidth = 800;
  const viewportHeight = 600;

  let browser: puppeteer.Browser | null = null;
  let numFailedTests: number | null = null;
  try {
    browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setViewport({width: viewportWidth, height: viewportHeight});

    page.on('dialog', (dialog) => {
      dialog.dismiss();
    });

    // TODO: move to utils
    page.on('console', async (msg) => {
      const args = await Promise.all(msg.args().map((a) => a.jsonValue()));
      console.log(...args);
    });

    numFailedTests = await Promise.race([
      waitForPageError(page),
      waitForTestsCompletion(page, url)
    ]);

    await browser.close();

    return numFailedTests;
  } catch (error) {
    if (browser) {
      try {
       browser!.close();
      } catch (_) {
        // Ignore the error since we're already handling an exception.
      }
    }

    throw error;
  }
}

async function waitForTestsCompletion(page: puppeteer.Page, url: string):
  Promise<number> {
  const loadTimeout = 20000;

  const getTests = new Promise<Array<{title: string}>>((resolve) =>
    page.exposeFunction('puppeteerRunTests', resolve)
  );

  await page.goto(url, {timeout: loadTimeout});

  const tests = await getTests;

  // TODO: add a timeout for each test to make sure we terminate if they get
  // stuck.
  for (const [i, {title}] of tests.entries()) {
    await page.evaluate(`puppeteerRenderTest(${i})`);
    const screenshot = await page.screenshot();
    // TODO: Compare the screenshot using eyes
    console.log({title, screenshotBufferSize: screenshot.byteLength});
    await page.evaluate(`puppeteerCleanupTest(${i})`);
  }

  return 0;
}

export async function eyesTest() {
  let server: IServer | null = null;
  try {
    server = await serve({webpackConfig: getWebpackConfig()});
    const numFailedTests = await runTests(server.getUrl());
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
