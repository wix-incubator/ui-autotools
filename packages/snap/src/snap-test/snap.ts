const {TestFailedError, TestResults} = require('@applitools/eyes.sdk.core');
const {makeVisualGridClient, makeGetConfig} = require('@applitools/visual-grid-client');
const {domNodesToCdt} = require('@applitools/visual-grid-client/browser');
import path from 'path';
import chalk from 'chalk';
import {JSDOM} from 'jsdom';
import {consoleLog, consoleError} from '@ui-autotools/utils';
import {parseSnapshotFilename} from '../generate-snapshots/filename-utils';
import { IFileInfo } from '../generate-snapshots/build-base-files';
import { IFileSystem } from '..';

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

  if (!process.env.APPLITOOLS_API_KEY && !process.env.EYES_API_KEY) {
    throw new Error('The environment variable "APPLITOOLS_API_KEY" needs to be defined.');
  }

  if (!process.env.APPLITOOLS_API_KEY) {
    consoleError('Warning: falling back to using process.env.EYES_API_KEY, please set process.env.APPLITOOLS_API_KEY instead.');
  }

  const branchName = projectName + '/master';
  const viewportWidth = 800;
  const viewportHeight = 600;

  return {
    appName: projectName,
    apiKey: process.env.APPLITOOLS_API_KEY || process.env.EYES_API_KEY,
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

function getStaticResources(cssFiles: IFileInfo[], resourceDir: string, fs: IFileSystem): {[url: string]: IResource} {
  const resources: {[url: string]: IResource} = {};
  for (const cssFile of cssFiles) {
    resources[cssFile.filename] = {
      url: cssFile.filename + '.css',
      type: 'text/css',
      value: fs.readFileSync(path.join(resourceDir, cssFile.filename + '.css')) as Buffer
    };
  }
  return resources;
}

function formatName(filename: string) {
  const {compName, simName, styleName} = parseSnapshotFilename(filename);

  return styleName ? `${compName}: ${simName}. Style: ${styleName}.` : `${compName}: ${simName}.`;
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

export async function runEyes(projectPath: string, tempDirectory: string, fs: IFileSystem, files: IFileInfo[]) {
  const config = getGridClientConfig(projectPath);
  const resources = getStaticResources(files, tempDirectory, fs);
  const gridClient = makeVisualGridClient(makeGetConfig());

  const resultPromises = [];
  consoleLog('Sending snapshots to Applitools...');

  for (const file of files) {
    const html = fs.readFileSync(path.join(tempDirectory, file.filename + '.snapshot.snapshot.html'), 'utf-8');
    const testName = formatName(file.filename);

    const result = getTestResult(runTest(
      gridClient,
      config,
      testName,
      html as string,
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
