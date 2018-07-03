/* tslint:disable:no-console */
import path from 'path';
import puppeteer from 'puppeteer';
import {WebpackConfigurator} from 'ui-autotools-utils';
import {serve, IServer} from 'ui-autotools-utils';
import axe from 'axe-core';
import chalk from 'chalk';

const packagePath = path.resolve(__dirname, '..');
const impactArray: axe.ImpactValue[] = ['minor', 'moderate', 'serious', 'critical'];

function getWebpackConfig(p: string) {
  const webpackConfigPath = path.join(process.cwd(), p, 'meta.webpack.config.js');
  return WebpackConfigurator
    .load(webpackConfigPath)
    .addEntry('meta', path.join(packagePath, 'src/browser/run'))
    .addHtml({
      template: path.join(packagePath, 'src/browser/index.html'),
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
        msg.push(`${index++}. ${chalk.red(violation.id === 'duplicate-id' ? 'Document' : node.target[0].replace('#', ''))}: (Impact: ${violation.impact}) ${node.failureSummary}`);
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
  console.log('Running accessibility tests...');
  try {
    server = await serve({webpackConfig: getWebpackConfig(p)});
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    const getResults = new Promise<axe.AxeResults>((resolve) =>
      page.exposeFunction('runAxeTest', resolve)
    );
    await page.goto(server.getUrl());
    const results = await getResults;
    console.log(printResults(results, impact));
    browser.close();
    process.exitCode = 0;
  } catch (error) {
    process.exitCode = 1;
    console.error(error ? error.message : '');
  } finally {
    if (server) {
      server.close();
    }
    process.exit();
  }
}
