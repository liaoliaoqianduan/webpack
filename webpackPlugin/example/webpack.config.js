const path = require("path");
const WebpackPluginRelease = require("../plugin");
module.exports = {
  entry: "./a.js",
  mode: "development",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [new WebpackPluginRelease({ version: "1.0.1" })],
};
