import chai from 'chai';
(window as any).expect = chai;

// In headless mode we run Mocha with console reporter and pipe all console
// output into stdout. But passing structures - especially circular - between
// browser and Node is inefficient and can cause Puppeteer to freeze. The
// solution is to wrap console.log with a function that does all formatting
// in the browser. This allows us to pass only primitive values to Node.
// __HEADLESS__ is a boolean value injected by Webpack.

require('../../patch-console')();
// Mocha officially supports these two imports in browser environment.
require('mocha/mocha.js');

mocha.setup({
  ui: 'bdd',
  reporter: 'spec',
  useColors: true
});

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
