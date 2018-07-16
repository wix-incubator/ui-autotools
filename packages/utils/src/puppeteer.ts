import puppeteer from 'puppeteer';
import {consoleLog, consoleError} from './index';
// In headless mode we run Mocha with console reporter and pipe all console
// output into stdout. But passing structures - especially circular - between
// browser and Node is inefficient and can cause Puppeteer to freeze. The
// solution is to wrap console.log with a function that does all formatting
// in the browser. This allows us to pass only primitive values to Node.
// __HEADLESS__ is a boolean value injected by Webpack.

require('../patch-console')();

export function waitForPageError(page: puppeteer.Page): Promise<never> {
    return new Promise((_, reject) => {
        page.on('pageerror', (errorText: string) => {
            reject(new Error(errorText));
        });

        page.on('error', () => {
            reject(new Error('Page crashed'));
        });
    });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadTestPage(page: any, testPageUrl: string, timeout: number) {
  // This can keep the process from terminating for upto `timeout` if an error
  // occurs on the page before page load event. But the problem should not occur
  // in headless mode.
  // Bug: https://github.com/GoogleChrome/puppeteer/issues/2721
  await page.goto(testPageUrl, {timeout});

  if (await page.evaluate(`typeof mochaStatus === 'undefined'`)) {
    throw new Error(`Variable mochaStatus not found on ${testPageUrl}`);
  }
}

async function waitForTestResults(page: any) {
  await page.waitForFunction('mochaStatus.finished');
  return page.evaluate('mochaStatus.numFailedTests');
}

async function failIfTestsStall(page: any, timeout: number) {
  let numCompletedTests = 0;

  while (true) {
    await sleep(timeout);
    const newVal = await page.evaluate('mochaStatus.numCompletedTests');
    if (newVal > numCompletedTests) {
      numCompletedTests = newVal;
    } else {
      throw new Error(`Tests are stuck for ${timeout}ms`);
    }
  }
}

function failOnPageError(page: any) {
  return new Promise((_, reject) => {
    // We don't need to handle `disconnected`, Puppeteer will throw anyway.

    page.on('pageerror', (errorText: string) => {
      reject(errorText);
    });

    page.on('error', () => {
      reject(new Error('Page crashed'));
    });
  });
}

export async function runTestsInPuppeteer({testPageUrl, noSandbox}: any) {
  const loadTimeout = 20000;
  const testTimeout = 5000;
  const viewportWidth = 800;
  const viewportHeight = 600;

  let browser;
  try {
    const args = noSandbox ? ['--no-sandbox', '--disable-setuid-sandbox'] : [];
    browser = await puppeteer.launch({headless: true, args});
    const page = await browser.newPage();
    await page.setViewport({width: viewportWidth, height: viewportHeight});

    page.on('dialog', (dialog) => {
      dialog.dismiss();
    });

    page.on('console', async (msg) => {
      const msgArgs = await Promise.all(msg.args().map((a) => a.jsonValue()));
      consoleLog(...msgArgs);
    });

    const numFailedTests = await Promise.race([
      failOnPageError(page),
      loadTestPage(page, testPageUrl, loadTimeout).then(() =>
        Promise.race([
          waitForTestResults(page),
          failIfTestsStall(page, testTimeout)
        ])
      )
    ]);

    return numFailedTests;
  } catch (error) {
    consoleError(error.toString());
    process.exitCode = 1;
  } finally {
    try {
      await (browser as any)!.close();
    } catch (_) {
      // Ignore the error since we're already handling an exception.
     }
  }
}
