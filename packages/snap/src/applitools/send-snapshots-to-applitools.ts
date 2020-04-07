const {Logger} = require('@applitools/eyes-common');
const {makeVisualGridClient, TestResults, TestFailedError} = require('@applitools/visual-grid-client');
const domNodesToCdt = require('@applitools/dom-snapshot/src/browser/domNodesToCdt');
import path from 'path';
import chalk from 'chalk';
import {JSDOM} from 'jsdom';
import {consoleLog, consoleError} from '@ui-autotools/utils';
import {ISnapshot, ISnapResource} from '../types';

interface ITestResult {
  status: 'error' | 'new' | 'modified' | 'unmodified';
  url?: string;
  error?: any;
}

interface IFormattedResource {
  url: string;
  type: string;
  value: Buffer;
}

function getGridClientConfig(projectPath: string) {
  const projectName = require(path.join(projectPath, 'package.json')).name;
  if (!projectName) {
    throw new Error('The project should have a package.json file with a "name" field.');
  }
  const showLogs = false;
  const branch = projectName + '/master';
  const viewportWidth = 1050;
  const viewportHeight = 1075;

  return {
    appName: projectName,
    apiKey: process.env.APPLITOOLS_API_KEY || process.env.EYES_API_KEY,
    branch,
    batchName: projectName,
    logger: new Logger(showLogs, 'visual-grid-client'),
    browser: {
      name: 'chrome',
      width: viewportWidth,
      height: viewportHeight
    }
  };
}

function formatResources(resources: ISnapResource[]): {[url: string]: IFormattedResource} {
  const formattedResources: {[url: string]: IFormattedResource} = {};
  for (const resource of resources) {
      formattedResources[resource.url] = {
        url: resource.url,
        type: resource.mimeType,
        value: resource.data
      };
  }
  return formattedResources;
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
    consoleError(error);
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

async function runTest(gridClient: any, gridClientConfig: any, testName: string, html: string, resources?: {[url: string]: IFormattedResource}) {
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

  return close(false); // call with false so that any "test modified" errors are resolved rather than rejected
}

export async function runEyes(projectPath: string, snapshots: ISnapshot[]) {
  const config = getGridClientConfig(projectPath);
  const gridClient = makeVisualGridClient(config);

  const resultPromises = [];
  consoleLog('Sending snapshots to Applitools...');

  for (const snapshot of snapshots) {
    const resources = snapshot.staticResources ? formatResources(snapshot.staticResources) : undefined;

    const result = getTestResult(runTest(
      gridClient,
      config,
      snapshot.testName,
      snapshot.html,
      resources
    ));

    result.then((res: ITestResult) => {
      if (res.status === 'error' || res.status === 'modified') {
        process.exitCode = 1;
        logEyesResult(snapshot.testName, res);
      } else {
        logEyesResult(snapshot.testName, res);
      }
    });

    resultPromises.push(result);
  }

  await Promise.all(resultPromises);
}
