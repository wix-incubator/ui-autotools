const path = require('path');
const fs = require('fs');
const {makeVisualGridClient, initConfig} = require('@applitools/visual-grid-client');
const domNodesToCdt = require('@applitools/visual-grid-client/src/browser-util/domNodesToCdt');
const {JSDOM} = require('jsdom');

describe('visual-grid-client test', function() {
  let visualGridClient;
  const closePromises = [];

  before(() => {
    visualGridClient = makeVisualGridClient(initConfig());
  });

  // after(async () => await visualGridClient.waitForTestResults(closePromises));

  let checkWindow, close;
  beforeEach(async () => {
    ({checkWindow, close} = await visualGridClient.openEyes({
      appName: 'visual grid client with a cat',
      testName: 'visual-grid-client test',
    }));
  });
  afterEach(() => closePromises.push(close()));

  it('should work', () => {
    checkWindow({
      tag: 'first test',
      url: 'http://localhost/index.html',
      cdt: domNodesToCdt(
        new JSDOM(fs.readFileSync(path.join(__dirname, '../dist/snapshots/variant1.snapshot.html'), 'utf-8')).window
          .document,
      ),
      sizeMode: 'viewport',
      resourceContents: {
        'thing/test/main.css': {
          url: 'thing/test/main.css',
          type: 'text/css',
          value: fs.readFileSync(path.join(__dirname, '../dist/main.css')),
        },
      },
    });
  });
});
