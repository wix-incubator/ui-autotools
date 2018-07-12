const puppeteer = require('puppeteer');

function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadTestPage(page: any, testPageUrl: any, timeout: any) {
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

async function failIfTestsStall(page: any, timeout: any) {
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

    page.on('pageerror', (errorText: any) => {
      reject(errorText);
    });

    page.on('error', () => {
      reject(new Error('Page crashed'));
    });
  });
}

module.exports = async ({testPageUrl, noSandbox}: any) => {
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

    page.on('dialog', (dialog: any) => {
      dialog.dismiss();
    });

    page.on('console', async (msg: any) => {
      // tslint:disable-next-line:no-shadowed-variable
      const args = await Promise.all(msg.args().map((a: any) => a.jsonValue()));
      // tslint:disable-next-line:no-console
      console.log(...args);
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
  } finally {
    try {
      await (browser as any)!.close();
    // tslint:disable-next-line:no-empty
    } catch (_) {}
  }
};
