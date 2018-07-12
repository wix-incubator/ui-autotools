import chai from 'chai';
(window as any).expect = chai;

// Mocha officially supports these two imports in browser environment.

require('mocha/mocha.css');
require('mocha/mocha.js');

// if (!__HEADLESS__) {
//   require('./mocha-prettier.css');
// }

// if (__TEAMCITY__) {
//   require('mocha-teamcity-reporter/lib/teamcityBrowser');
// }

mocha.setup({
  ui: 'bdd',
  reporter: 'html',
  useColors: true
});

// Alias Mocha globals to their Jest equivalents. We can remove this once we
// start running all the tests in Mocha.

(window as any).beforeAll = window.before;
(window as any).afterAll = window.after;

// This needs to be accessible by Puppeteer.

(window as any).mochaStatus = {
  numCompletedTests: 0,
  numFailedTests: 0,
  finished: false
};

// Start Mocha in the next tick because we haven't yet included the test files.

setTimeout(() => {
  mocha.run()
    .on('test end', () => (window as any).mochaStatus.numCompletedTests++)
    .on('fail',     () => (window as any).mochaStatus.numFailedTests++)
    .on('end',      () => (window as any).mochaStatus.finished = true);
}, 0);
