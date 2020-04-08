import Mocha = require('mocha');
import path from 'path';

// The purpose of creating our own reporter is to completely silence
// the console.logs of this nested Mocha test suite. We only want to see
// the passes and failures of the suite that uses this file.
class MyReporter extends Mocha.reporters.Base {
  constructor(runner: Mocha.Runner, options: { reporterOptions?: any }) {
    super(runner);
    Mocha.reporters.Base.call(this, runner);
  }
}

const mocha = new Mocha({ reporter: MyReporter });

// Grab the ssr-test.js file
const pathToTest = path.dirname(require.resolve('./import-test.ts'));
mocha.addFile(pathToTest + '/import-test.ts');

// Invoking this method runs our ssr-test in the mocha environment
const ssrTest = (getPassFlag: (flag: number) => void) => {
  let passFlag = 1; // Default is passing
  mocha
    .run()
    .on('fail', () => {
      passFlag = -1; // If a test fails, set the flag to -1
    })
    .on('end', () => {
      getPassFlag(passFlag); // Return the flag once all tests are done
    });
};

export default ssrTest;
