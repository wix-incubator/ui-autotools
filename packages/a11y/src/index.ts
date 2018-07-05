/* tslint:disable:no-console */
import path from 'path';
import puppeteer from 'puppeteer';
import {WebpackConfigurator, serve, IServer, waitForPageError} from 'ui-autotools-utils';
import { IResult } from './browser/run';
import axe from 'axe-core';
import chalk from 'chalk';

const ownPath = path.resolve(__dirname, '..');
const impactArray: axe.ImpactValue[] = ['minor', 'moderate', 'serious', 'critical'];
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

function formatResults(results: IResult[], impact: number): string {
  const msg: string[] = [];
  let index = 1;
  results.forEach((res) => {
    if (res.error) {
      msg.push(`${index++}. ${res.comp}: Error while testing component - ${res.error}`);
    } else if (res.result) {
      res.result.violations.forEach((violation) => {
        if (impactArray.indexOf(violation.impact) + 1 >= impact) {
          violation.nodes.forEach((node) => {
            const compName = (`${res.comp} - ${node.target[0]}`);
            msg.push(`${index++}. ${chalk.red(compName)}: (Impact: ${violation.impact}) ${node.failureSummary}`);
          });
        }
      });
    }
  });
  return msg.join('\n\n');
}

export async function a11yTest(entry: string | string[], impact: number) {
  let server: IServer | null = null;
  let browser: puppeteer.Browser | null = null;
  console.log('Running accessibility tests...');
  try {
    server = await serve({webpackConfig: getWebpackConfig(entry)});
    browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    const getResults = new Promise<any[]>((resolve) =>
      page.exposeFunction('runAxeTest', resolve)
    );
    page.on('dialog', (dialog) => {
      dialog.dismiss();
    });
    await page.goto(server.getUrl());
    const results = await Promise.race([waitForPageError(page), getResults]);
    const message = formatResults(results, impact);
    if (message) {
      process.exitCode = 1;
      console.log(message);
    }
  } catch (error) {
    console.error(error.toString());
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
