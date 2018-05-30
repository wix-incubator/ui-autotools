import Mocha = require('mocha');
import path from 'path';

// Import all the metadata files
const mocha = new Mocha();

// Grab the ssr-test.js file
const pathToTest = path.dirname(require.resolve('./ssr-test.js'));
mocha.addFile(pathToTest + '/ssr-test.js');

const autoSSRTest = () => {
  mocha.run(function(failures: any) {
    process.exitCode = failures ? -1 : 0;
  })
}

export default autoSSRTest;