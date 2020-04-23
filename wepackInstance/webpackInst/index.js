const path = require('path');
const config = require(path.resolve('webpack.config.js'));
const Pack = require('./Pack');
const package = new Pack(config);
package.run();