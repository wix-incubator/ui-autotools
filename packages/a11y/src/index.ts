import path from 'path';
import puppeteer from 'puppeteer';
import {
  WebpackConfigurator,
  serve,
  IServer,
  waitForPageError,
  consoleError,
  consoleLog
} from '@ui-autotools/utils';
import { IResult } from './browser/run';
import axe from 'axe-core';
import chalk from 'chalk';

const ownPath = path.resolve(__dirname, '..');
export const impactLevels: axe.ImpactValue[] = [
  'minor',
  'moderate',
  'serious',
  'critical'
];

function getWebpackConfig(entry: string | string[], webpackConfigPath: string) {
  return WebpackConfigurator.load(webpackConfigPath)
    .setEntry('meta', entry)
    .addEntry('meta', path.join(ownPath, 'esm/browser/run'))
    .addHtml({
      template: path.join(ownPath, '/templates', 'index.template'),
      title: 'Accessibility'
    })
    .suppressReactDevtoolsSuggestion()
    .getConfig();
}

function formatResults(
  results: IResult[],
  impact: axe.ImpactValue
): { message: string; hasError: boolean } {
  const msg: string[] = [];
  let hasError = false;
  let index = 0;
  results.forEach((res) => {
    msg.push(`${index + 1}. Testing component ${res.comp}...`);
    if (res.error) {
      hasError = true;
      msg.push(`Error while testing component - ${res.error}`);
    } else if (res.result) {
      if (res.result.violations.length) {
        res.result.violations.forEach((violation) => {
          const impactLevel = res.impact ? res.impact : impact;

          if (
            violation.impact &&
            impactLevels.indexOf(violation.impact) >=
              impactLevels.indexOf(impactLevel)
          ) {
            hasError = true;
            violation.nodes.forEach((node) => {
              const selector = node.target.join(' > ');
              const compName = `${res.comp} - ${selector}`;
              msg[index] += `\n  ${chalk.red(compName)}: (Impact: ${
                violation.impact
              })\n  ${node.failureSummary}`;
            });
          } else {
            msg[index] += ' No errors found.';
          }
        });
      } else {
        msg[index] += ' No errors found.';
      }
    }
    index++;
  });
  return { message: msg.join('\n'), hasError };
}

export async function a11yTest(
  entry: string | string[],
  impact: axe.ImpactValue,
  webpackConfigPath: string
) {
  let server: IServer | null = null;
  let browser: puppeteer.Browser | null = null;
  consoleLog('Running a11y test...');
  try {
    server = await serve({
      webpackConfig: getWebpackConfig(entry, webpackConfigPath)
    });
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    const getResults = new Promise<any[]>((resolve) =>
      page.exposeFunction('puppeteerReportResults', resolve)
    );
    page.on('dialog', (dialog) => {
      dialog.dismiss();
    });
    await page.goto(server.getUrl());
    const results = await Promise.race([waitForPageError(page), getResults]);
    const { message, hasError } = formatResults(results, impact);
    if (hasError) {
      process.exitCode = 1;
      consoleError(message);
    } else {
      consoleLog(message);
    }
  } catch (error) {
    consoleError(error.toString());
    process.exitCode = 1;
  } finally {
    if (browser) {
      try {
        browser!.close();
      } catch (_) {
        // Ignore the error since we're already handling an exception.
      }
    }
    if (server) {
      server.close();
    }
    process.exit();
  }
}
