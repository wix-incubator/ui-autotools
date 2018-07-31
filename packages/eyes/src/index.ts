const {Eyes} = require('eyes.images');

import path from 'path';
import puppeteer from 'puppeteer';
import {WebpackConfigurator, serve, IServer, waitForPageError, logConsoleMessages, consoleLog} from '@ui-autotools/utils';
import chalk from 'chalk';
import uuid from 'uuid';

const packagePath = path.resolve(__dirname, '..');
const projectPath = process.cwd();
const webpackConfigPath = path.join(projectPath, 'meta.webpack.config.js');

const projectName = require(path.join(projectPath, 'package.json')).name;
const batchName   = projectName;
const batchId     = uuid.v4();
const osName      = process.platform;

if (!projectName) {
  process.exitCode = 1;
  throw new Error('The project should have a package.json file with a "name" field.');
  process.exit();
}

const eyes = new Eyes();
eyes.setApiKey(process.env.EYES_API_KEY);
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

function logEyesResult(isError: boolean, {name, isNew, appUrls}: any) {
  const url = isError ? `${chalk.cyan('URL')}: ${chalk.underline(appUrls.session)}` : '';
  const status = isError ? chalk.red('👎 FAIL') :
               isNew ? chalk.yellow('👌  NEW') :
               chalk.green('👍  OK');

  consoleLog(`${status} ${chalk.bold(name)}. ${url}`);
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
  let numTestsFailed: number = 0;
  let result;
  for (const [i, {title}] of tests.entries()) {
    await page.evaluate(`puppeteerRenderTest(${i})`);
    const screenshot = await page.screenshot();
    await eyes.open(projectName, title, null);
    await eyes.checkImage(screenshot);
    result = await eyes.close(false);

    const isError = result.status !== 'Passed' && !result.isNew;
    if (isError) {
      numTestsFailed++;
    }

    logEyesResult(isError, result);
    await page.evaluate(`puppeteerCleanupTest(${i})`);
  }

  consoleLog(`Batch URL: ${chalk.underline(result.appUrls.batch)}`);

  return numTestsFailed;
}

export async function eyesTest(entry: string | string[], apiKey: string) {
  let server: IServer | null = null;
  if (!apiKey) {
    process.exitCode = 1;
    throw new Error('The environment variable "EYES_API_KEY" needs to be defined.');
    process.exit();
  }
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
