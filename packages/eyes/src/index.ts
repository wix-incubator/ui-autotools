const {Eyes} = require('eyes.images');

import path from 'path';
import puppeteer from 'puppeteer';
import {WebpackConfigurator, serve, IServer, waitForPageError, logConsoleMessages, consoleLog} from '@ui-autotools/utils';
import chalk from 'chalk';
import uuid from 'uuid';

const packagePath = path.resolve(__dirname, '..');

function getWebpackConfig(entry: string | string[], webpackConfigPath: string) {
  return WebpackConfigurator
    .load(webpackConfigPath)
    .setEntry('meta', entry)
    .addEntry('meta', path.join(packagePath, 'esm/browser/run'))
    .addHtml({
      template: path.join(packagePath, '/templates', 'index.template'),
      title: 'Accessibility'
    })
    .suppressReactDevtoolsSuggestion()
    .getConfig();
}

async function runTests(url: string, eyes: any, projectName: string) {
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
      waitForTestsCompletion(page, eyes, projectName, url)
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

async function waitForTestsCompletion(page: puppeteer.Page, url: string, eyes: any, projectName: string):
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

export async function eyesTest(entry: string | string[], projectPath: string, webpackConfigPath: string) {
  let server: IServer | null = null;
  const batchId     = uuid.v4();
  const osName      = process.platform;
  const apiKey      = process.env.EYES_API_KEY;

  const eyes = new Eyes();

  try {
    const projectName = require(path.join(projectPath, 'package.json')).name;
    if (!projectName) {
      throw new Error('The project should have a package.json file with a "name" field.');
    }

    if (!apiKey) {
      throw new Error('The environment variable "EYES_API_KEY" needs to be defined.');
    }

    eyes.setApiKey(apiKey);
    eyes.setOs(osName);

    const batchName   = projectName;
    eyes.setBatch(batchName, batchId);

    server = await serve({webpackConfig: getWebpackConfig(entry, webpackConfigPath)});
    const numFailedTests = await runTests(server.getUrl(), eyes, projectName);
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
