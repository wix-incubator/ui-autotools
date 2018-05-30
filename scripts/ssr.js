const Mocha = require('mocha'),
    fs = require('fs'),
    path = require('path');

// Import all the metadata files

const mocha = new Mocha();

// Grab the ssr-test.js file
mocha.addFile('scripts/ssr-test.js');

const autoSSRTest = () => {
  mocha.run(function(failures) {
    process.exitCode = failures ? -1 : 0;
  })
}

module.exports = autoSSRTest;