import Mocha = require('mocha');
import path from 'path';

const mocha = new Mocha();

// Grab the ssr-test.js file
const pathToTest = path.dirname(require.resolve('./ssr-test.ts'));
mocha.addFile(pathToTest + '/ssr-test.ts');
mocha.reporter('min');

// Invoking this method runs our ssr-test in the mocha environment
const autoSSRTest = (getPassFlag: (flag: number) => void) => {
  // Run the ssr-test file
  let passFlag = 1;
  mocha.run()
    .on('fail', () => {
        passFlag = -1;
    })
    .on('end', () => {
        getPassFlag(passFlag);
    });
};

export default autoSSRTest;
