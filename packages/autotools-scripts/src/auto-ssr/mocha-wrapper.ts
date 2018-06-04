import Mocha = require('mocha');
import path from 'path';

const mocha = new Mocha();

// Grab the ssr-test.js file
const pathToTest = path.dirname(require.resolve('./ssr-test.js'));
mocha.addFile(pathToTest + '/ssr-test.js');

// Invoking this method runs our ssr-test in the mocha environment
const autoSSRTest = () => {
  // Run the ssr-test file
  mocha.run(function(failures: any) {
    process.exitCode = failures ? -1 : 0;
  })
}

export default autoSSRTest;
