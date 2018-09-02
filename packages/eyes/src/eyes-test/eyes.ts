const {TestFailedError, TestResults} = require('@applitools/eyes.sdk.core');
const {makeVisualGridClient, initConfig} = require('@applitools/visual-grid-client');
const domNodesToCdt = require('@applitools/visual-grid-client/src/browser-util/domNodesToCdt');
import path from 'path';
import fs from 'fs';
import glob from 'glob';
import chalk from 'chalk';
import {JSDOM} from 'jsdom';
import {consoleLog} from '@ui-autotools/utils';
import {parseSnapshotFilename} from '../generate-snapshots/filename-utils';

interface ITestResult {
  status: 'error' | 'new' | 'modified' | 'unmodified';
  url?: string;
  error?: any;
}

function getGridClientConfig(projectPath: string) {
  const projectName = require(path.join(projectPath, 'package.json')).name;
  if (!projectName) {
    throw new Error('The project should have a package.json file with a "name" field.');
  }

  if (!process.env.APPLITOOLS_API_KEY) {
    throw new Error('The environment variable "APPLITOOLS_API_KEY" needs to be defined.');
  }

  const branchName = projectName + '/master';
  const viewportWidth = 800;
  const viewportHeight = 600;

  return {
    appName: projectName,
    branchName,
    batchName: projectName,
    browser: {
      name: 'chrome',
      width: viewportWidth,
      height: viewportHeight
    }
  };
}

interface IResource {
  url: string;
  type: string;
  value: Buffer;
}

function getStaticResources(cssFilenames: string[], resourceDir: string): {[url: string]: IResource} {
  const resources: {[url: string]: IResource} = {};
  for (const cssFilename of cssFilenames) {
    resources[cssFilename] = {
      url: cssFilename,
      type: 'text/css',
      value: fs.readFileSync(path.join(resourceDir, cssFilename))
    };
  }
  return resources;
}

function formatName(filename: string) {
  const {compName, simName, styleName} = parseSnapshotFilename(filename, '.snapshot.html');

  return `${compName}: ${simName}. Style: ${styleName}.`;
}

function logEyesResult(name: string, {status, url, error}: ITestResult) {
  const isModified = status === 'modified';
  const isNew = status === 'new';
  const isError = status === 'error';

  const formattedUrl = url && isModified ? `${chalk.cyan('URL')}: ${chalk.underline(url)}` : '';
  const statusMessage = isModified ? chalk.red('MODIFIED') :
               isNew ? chalk.green('NEW') :
               isError ? chalk.bgRedBright('ERROR') :
               chalk.green('UNMODIFIED');
  consoleLog(`${statusMessage} ${name} ${formattedUrl}`);

  if (isError) {
    consoleLog(error);
  }
}

// We cannot allow any of the result promises to reject, because we're going to
// await on a bunch of them in parallel using Promise.all, and a single rejected
// promise would reject the entire batch.
function getTestResult(testResult: Promise<any>): Promise<ITestResult> {
  return (
    testResult
    .catch((err: any) => err)
    .then((res: any) => res instanceof TestFailedError ? res.getTestResults() : res)
    .then((res: any) => Array.isArray(res) && res[0] instanceof TestResults ? res[0] : res)
    .then((res: any): ITestResult => {
      if (res instanceof TestResults) {
        const url = res.getUrl();
        if (res.getIsDifferent()) {
          return {status: 'modified', url};
        }
        if (res.getIsNew()) {
          return {status: 'new', url};
        }
        if (res.isPassed()) {
          return {status: 'unmodified', url};
        }
      }

      return {status: 'error', error: res};
    })
  );
}

async function runTest(gridClient: any, gridClientConfig: any, testName: string, html: string, resources: {[url: string]: IResource}) {
  const dom = new JSDOM(html).window.document;

  const {checkWindow, close} = await gridClient.openEyes({
    ...gridClientConfig,
    testName,
  });

  await checkWindow({
    url: 'http://localhost/html/index.html',
    cdt: domNodesToCdt(dom),
    sizeMode: 'viewport',
    resourceContents: resources
  });

  return close();
}

export async function runEyes(projectPath: string, directory: string) {
  const cssFilenames  = glob.sync('*.css', {cwd: directory});
  const htmlFilenames = glob.sync('*.snapshot.html', {cwd: directory});

  const config = getGridClientConfig(projectPath);
  const resources = getStaticResources(cssFilenames, directory);
  const gridClient = makeVisualGridClient(initConfig());

  const resultPromises = [];
  consoleLog('Sending snapshots to Applitools...');

  for (const htmlFilename of htmlFilenames) {
    const html = fs.readFileSync(path.join(directory, htmlFilename), 'utf-8');
    const testName = formatName(htmlFilename);

    const result = getTestResult(runTest(
      gridClient,
      config,
      testName,
      html,
      resources
    ));

    result.then((res: ITestResult) => {
      if (res.status === 'error' || res.status === 'modified') {
        process.exitCode = 1;
        logEyesResult(testName, res);
      } else {
        logEyesResult(testName, res);
      }
    });

    resultPromises.push(result);
  }

  await Promise.all(resultPromises);

  process.exit();
}
