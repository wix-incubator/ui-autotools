var meta_data_tools_1 = require("meta-data-tools");
var React = require("react");
var TestComp = function (props) {
  return React.createElement("h1", null,
      "Hey ",
      props.text,
      " person");
};

meta_data_tools_1.default.describe(TestComp);