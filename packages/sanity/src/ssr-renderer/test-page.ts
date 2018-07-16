// Mocha officially supports this import in browser environment
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
