var meta_data_tools_1 = require("meta-data-tools");
var FailingTestComp = function () {
  var accessDocument = function () {
      document.createElement('div');
  };
  accessDocument();
  return null;
};
// MetaDataTools.clean();
meta_data_tools_1.default.describe(FailingTestComp);