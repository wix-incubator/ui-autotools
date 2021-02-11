import mochaModule from 'mocha/mocha.js';

const mochaInstance: BrowserMocha = mochaModule && 'setup' in mochaModule ? mochaModule : (window as any).mocha;

mochaInstance.setup({
  ui: 'bdd',
  reporter: 'spec',
  color: true,
});

const mochaStatus = {
  completed: 0,
  failed: 0,
  finished: false,
};

// save test status on window to access it remotely
(window as any).mochaStatus = mochaStatus;

window.addEventListener('DOMContentLoaded', () => {
  mochaInstance
    .run()
    .on('test end', () => mochaStatus.completed++)
    .on('fail', () => mochaStatus.failed++)
    .on('end', () => (mochaStatus.finished = true));
});
