import playwright from 'playwright-core';
import { sleep } from './sleep';
import { consoleLog } from './index';

export async function testInBrowser(testPageUrl: string) {
  const loadTimeout = 20000;
  const testTimeout = 5000;

  const browser = await playwright.chromium.launch();
  try {
    const browserContext = await browser.newContext();
    const page = await browserContext.newPage();

    page.on('dialog', (dialog) => {
      dialog.dismiss();
    });

    logConsoleMessages(page);

    const numFailedTests = await Promise.race([
      waitForPageError(page),
      loadTestPage(page, testPageUrl, loadTimeout).then(() =>
        Promise.race([waitForTestResults(page), failIfTestsStall(page, testTimeout)])
      ),
    ]);

    return numFailedTests;
  } finally {
    await browser.close();
  }
}

export function waitForPageError(page: playwright.Page) {
  return new Promise<never>((_, reject) => {
    page.on('pageerror', (e) => reject(e));
    page.on('crash', () => reject(new Error(`Page crashed ${page.url()}`)));
  });
}

function logConsoleMessages(page: playwright.Page) {
  page.on('console', async (msg) => {
    const msgArgs = await Promise.all(msg.args().map((a) => a.jsonValue()));
    consoleLog(...msgArgs);
  });
}

async function loadTestPage(page: playwright.Page, testPageUrl: string, timeout: number) {
  await page.goto(testPageUrl, { timeout });

  if (await page.evaluate(`typeof mochaStatus === 'undefined'`)) {
    throw new Error(`Variable mochaStatus not found on ${testPageUrl}`);
  }
}

async function waitForTestResults(page: playwright.Page) {
  await page.waitForFunction('mochaStatus.finished');
  return page.evaluate('mochaStatus.numFailedTests');
}

async function failIfTestsStall(page: playwright.Page, timeout: number) {
  let numCompletedTests = 0;

  while (true) {
    await sleep(timeout);
    const newVal = (await page.evaluate('mochaStatus.numCompletedTests')) as number;
    if (newVal > numCompletedTests) {
      numCompletedTests = newVal;
    } else {
      throw new Error(`Tests are stuck for ${timeout}ms`);
    }
  }
}
