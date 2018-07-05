import path from 'path';
import puppeteer from 'puppeteer';
import {WebpackConfigurator, serve, IServer, waitForPageError, consoleError} from 'ui-autotools-utils';
import { IResult } from './browser/run';
import axe from 'axe-core';
import chalk from 'chalk';

const ownPath = path.resolve(__dirname, '..');
export const impactArray: axe.ImpactValue[] = ['minor', 'moderate', 'serious', 'critical'];
const projectPath = process.cwd();
const webpackConfigPath = path.join(projectPath, 'meta.webpack.config.js');

function getWebpackConfig(entry: string | string[]) {
  return WebpackConfigurator
    .load(webpackConfigPath)
    .setEntry('meta', entry)
    .addEntry('meta', path.join(ownPath, 'esm/browser/run'))
    .addHtml({
      template: path.join(ownPath, 'src/browser/index.html'),
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
        if (impactArray.indexOf(violation.impact) >= impactArray.indexOf(impact)) {
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

export async function a11yTest(entry: string | string[], impact: axe.ImpactValue) {
  let server: IServer | null = null;
  let browser: puppeteer.Browser | null = null;
  try {
    server = await serve({webpackConfig: getWebpackConfig(entry)});
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
