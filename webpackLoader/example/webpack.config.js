

const path = require('path')
module.exports = {
  entry: './index.js',
  mode:'development',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{
          loader: 'inject-css',
          options: {
            cache:true,
          }
        }]
      }
    ]
  },
  resolveLoader: {
    modules: ['node_modules',path.join(__dirname, '../loader')]
  }
}
