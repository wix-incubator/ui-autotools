/* tslint:disable:no-console */

import path from 'path';
import puppeteer from 'puppeteer';
import {WebpackConfigurator, serve, IServer, waitForPageError, logConsoleMessages, consoleLog} from '@ui-autotools/utils';
import chalk from 'chalk';
require('dotenv').config();
const uuid = require('uuid');
const {Eyes} = require('eyes.images');

const packagePath = path.resolve(__dirname, '..');
const projectPath = process.cwd();
const webpackConfigPath = path.join(projectPath, 'meta.webpack.config.js');

const projectName = require(path.join(projectPath, 'package.json')).name;
const batchName   = projectName;
const batchId     = uuid.v4();
const eyesApiKey  = process.env.EYES_API_KEY;
const osName      = process.platform;

if (!eyesApiKey) {
  process.exitCode = 1;
  throw new Error('"EYES_API_KEY" needs to be defined in a ".env" file located in the root.');
  process.exit();
}

const eyes = new Eyes();
eyes.setApiKey(eyesApiKey);
eyes.setOs(osName);
eyes.setBatch(batchName, batchId);

function getWebpackConfig(entry: string | string[]) {
  return WebpackConfigurator
    .load(webpackConfigPath)
    .setEntry('meta', entry)
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

    logConsoleMessages(page);

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

function logResult({name, status, isNew, appUrls}: any) {
  const isError = status === 'Unresolved' && isNew.toString() === 'false';
  const dividerString = '--------------------';
  const errorString = '~~~~~~~~~~~~~~~~~~~~';
  const divider = isError ? chalk.red(errorString) : dividerString;

  consoleLog(`
  ${divider}
  ${isError ? chalk.red('ERROR') : ''} ${chalk.bold(name)}: ${status === 'Unresolved' ? chalk.red(status) : chalk.green(status)}. Is new: ${isNew.toString() === 'false' ? chalk.green(isNew) : chalk.yellow(isNew)}.
  ${chalk.cyan('URL')}: ${chalk.underline(appUrls.batch)}
  ${divider}
  `);
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
  let testsPassed: boolean = true;
  consoleLog('Format: <component simName>');
  for (const [i, {title}] of tests.entries()) {
    let result;
    await page.evaluate(`puppeteerRenderTest(${i})`);
    const screenshot = await page.screenshot();
    await eyes.open(projectName, title, null);
    const {asExpected} = await eyes.checkImage(screenshot);
    if (!asExpected && testsPassed) {
      testsPassed = false;
    }
    result = await eyes.close(false);
    logResult(result);
    await page.evaluate(`puppeteerCleanupTest(${i})`);
  }

  if (!testsPassed) {
    process.exitCode = 1;
    process.exit();
  }

  return 0;
}

export async function eyesTest(entry: string | string[]) {
  let server: IServer | null = null;
  try {
    server = await serve({webpackConfig: getWebpackConfig(entry)});
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
