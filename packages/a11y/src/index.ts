import path from 'path';
import puppeteer from 'puppeteer';
import {WebpackConfigurator, serve, IServer, waitForPageError, consoleError} from '@ui-autotools/utils';
import { IResult } from './browser/run';
import axe from 'axe-core';
import chalk from 'chalk';

const ownPath = path.resolve(__dirname, '..');
export const impactLevels: axe.ImpactValue[] = ['minor', 'moderate', 'serious', 'critical'];

function getWebpackConfig(entry: string | string[], webpackConfigPath: string) {
  return WebpackConfigurator
    .load(webpackConfigPath)
    .setEntry('meta', entry)
    .addEntry('meta', path.join(ownPath, 'esm/browser/run'))
    .addHtml({
      template: path.join(ownPath, '/templates', 'index.template'),
      title: 'Accessibility'
    })
    .suppressReactDevtoolsSuggestion()
    .getConfig();
}

function formatResults(results: IResult[], impact: axe.ImpactValue): string {
  const msg: string[] = [];
  let index = 1;
  results.forEach((res) => {
    if (res.error) {
      msg.push(`${index++}. ${res.comp}: Error while testing component - ${res.error}`);
    } else if (res.result) {
      res.result.violations.forEach((violation) => {
        if (impactLevels.indexOf(violation.impact) >= impactLevels.indexOf(impact)) {
          violation.nodes.forEach((node) => {
            const selector = node.target.join(' > ');
            const compName = (`${res.comp} - ${selector}`);
            msg.push(`${index++}. ${chalk.red(compName)}: (Impact: ${violation.impact})\n${node.failureSummary}`);
          });
        }
      });
    }
  });
  return msg.join('\n\n');
}

export async function a11yTest(entry: string | string[], impact: axe.ImpactValue, webpackConfigPath: string) {
  let server: IServer | null = null;
  let browser: puppeteer.Browser | null = null;
  try {
    server = await serve({webpackConfig: getWebpackConfig(entry, webpackConfigPath)});
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
    const message = formatResults(results, impact);
    if (message) {
      process.exitCode = 1;
      consoleError(message);
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
