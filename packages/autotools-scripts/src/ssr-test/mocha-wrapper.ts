import Mocha = require('mocha');

const mocha = new Mocha();

// Grab the ssr-test.js file
const pathToTest = require.resolve('./ssr-test.js');
mocha.addFile(pathToTest);

// Invoking this method runs our ssr-test in the mocha environment
const autoSSRTest = () => {
  // Run the ssr-test file
  mocha.run((failures: number) => {
    process.exitCode = failures ? -1 : 0;
  });
};

export default autoSSRTest;
