/* tslint:disable:no-console */
import path from 'path';
import puppeteer from 'puppeteer';
import {WebpackConfigurator} from 'ui-autotools-utils';
import {serve, IServer} from 'ui-autotools-utils';
import axe from 'axe-core';
import chalk from 'chalk';

const packagePath = path.resolve(__dirname, '..');

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

function printViolations(violations: axe.Result[], impact: axe.ImpactValue = 'minor'): string {
  const errors: string[] = [];
  let index = 1;
  violations.forEach((violation) => {
    if (isImpactRelevant(violation.impact, impact)) {
      violation.nodes.forEach((node) => {
        errors.push(`${index++}. ${chalk.red(violation.id === 'duplicate-id' ? 'Document' : node.target[0].replace('#', ''))}: (Impact: ${violation.impact}) ${node.failureSummary}`);
      });
    }
  });
  return errors.join('\n\n');
}

function isImpactRelevant(impact: axe.ImpactValue, minImpact: axe.ImpactValue): boolean {
  const impactArray = ['minor', 'moderate', 'serious', 'critical'];
  return impactArray.indexOf(impact) >= impactArray.indexOf(minImpact);
}

export async function a11yTest(p: string) {
  let server: IServer | null = null;
  try {
    server = await serve({webpackConfig: getWebpackConfig(p)});
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const getResults = new Promise<axe.AxeResults>((resolve) =>
      page.exposeFunction('runAxeTest', resolve)
    );
    await page.goto(server.getUrl());
    const results = await getResults;
    if (results.violations.length) {
      console.log(printViolations(results.violations));
    } else {
      console.log('No errors found');
    }
    if (server) {
      server.close();
    }
    // await page.evaluate(`window.axeImpact = "${'minor'}"`);
    process.exitCode = 0;
    process.exit();
    // Maybe add settimeout as backup?
  } catch (error) {
    process.exitCode = 1;
    console.error(error ? error.message : '');
  }
}
