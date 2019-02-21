const {StylableSnapPlugin} = require('@ui-autotools/snap');
const {MockRepoPlugin} = require('./plugins/mock-repo-plugin');

const config = {
  plugins: [
    new StylableSnapPlugin(),
    new MockRepoPlugin()
  ]
};

module.exports = config;
