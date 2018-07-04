/* tslint:disable:no-console */
import path from 'path';
import puppeteer from 'puppeteer';
import {WebpackConfigurator, serve, IServer, waitForPageError} from 'ui-autotools-utils';
import axe from 'axe-core';
import chalk from 'chalk';

const ownPath = path.resolve(__dirname, '..');
const impactArray: axe.ImpactValue[] = ['minor', 'moderate', 'serious', 'critical'];

function getWebpackConfig(p: string) {
  const webpackConfigPath = path.join(process.cwd(), p, 'meta.webpack.config.js');
  return WebpackConfigurator
    .load(webpackConfigPath)
    .addEntry('meta', path.join(ownPath, 'esm/browser/run'))
    .addHtml({
      template: path.join(ownPath, 'src/browser/index.html'),
      title: 'Accessibility'
    })
    .suppressReactDevtoolsSuggestion()
    .getConfig();
}

function printResults(results: axe.AxeResults, impact: number): string {
  const msg: string[] = [];
  let index = 1;
  results.violations.forEach((violation) => {
    if (impactArray.indexOf(violation.impact) + 1 >= impact) {
      violation.nodes.forEach((node) => {
        msg.push(`${index++}. ${chalk.red(violation.id === 'duplicate-id' ? 'Document' : node.target[0])}: (Impact: ${violation.impact}) ${node.failureSummary}`);
      });
    }
  });
  if (msg.length === 0) {
    return 'No errors found';
  } else {
    return msg.join('\n\n');
  }
}

export async function a11yTest(p: string, impact: number) {
  let server: IServer | null = null;
  let browser: puppeteer.Browser | null = null;
  console.log('Running accessibility tests...');
  try {
    server = await serve({webpackConfig: getWebpackConfig(p)});
    browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    const getResults = new Promise<axe.AxeResults>((resolve) =>
      page.exposeFunction('runAxeTest', resolve)
    );
    page.on('dialog', (dialog) => {
      dialog.dismiss();
    });
    await page.goto(server.getUrl());
    const results = await Promise.race([waitForPageError(page), getResults]);
    console.log(printResults(results, impact));

    process.exitCode = 0;
  } catch (error) {
    if (browser) {
      try {
       browser!.close();
      } catch (_) {
        // Ignore the error since we're already handling an exception.
      }
    }
    console.error(error.toString());
  } finally {
    if (server) {
      server.close();
    }
    process.exit();
  }
}
