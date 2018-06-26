import Mocha = require('mocha');
import path from 'path';

class MyReporter {
    constructor(runner: Mocha.Runner, options: { reporterOptions?: any; }) {
        Mocha.reporters.Base.call(this, runner);
    }
}

const mocha = new Mocha({reporter: MyReporter as Mocha.ReporterConstructor});

// Grab the ssr-test.js file
const pathToTest = path.dirname(require.resolve('./ssr-test.ts'));
mocha.addFile(pathToTest + '/ssr-test.ts');

// Invoking this method runs our ssr-test in the mocha environment
const autoSSRTest = (getPassFlag: (flag: number) => void) => {
  // Run the ssr-test file
  let passFlag = 1;
  mocha.run()
    // tslint:disable-next-line:no-empty
    .on('start', () => {})
    // tslint:disable-next-line:no-empty
    .on('pass', () => {})
    // tslint:disable-next-line:no-empty
    .on('test', () => {})
    .on('fail', () => {
        passFlag = -1;
    })
    .on('end', () => {
        getPassFlag(passFlag);
    });
};

export default autoSSRTest;
