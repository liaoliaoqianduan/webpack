const zipper = require("zip-local");
const formatDateTime = function (date) {
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  m = m < 10 ? "0" + m : m;
  let d = date.getDate();
  d = d < 10 ? "0" + d : d;
  let h = date.getHours();
  h = h < 10 ? "0" + h : h;
  let minute = date.getMinutes();
  minute = minute < 10 ? "0" + minute : minute;
  let second = date.getSeconds();
  second = second < 10 ? "0" + second : second;
  return y + "-" + m + "-" + d + "-" + h + "-" + minute + "-" + second;
};
module.exports = class WebpackPluginRelease {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    compiler.plugin("emit", (compilation, next) => {
      let version =
        this.options && this.options.version
          ? "@" + this.options.version
          : formatDateTime(new Date());
      zipper.sync
        .zip(compiler.options.output.path)
        .compress()
        .save(`./build/plugin${version}.zip`);
      next();
    });
  }
};
