const path = require('path');
const glob = require('glob');

const packagePath = __dirname;
const metaGlob = 'src/**/*.meta.ts?(x)';

module.exports = {
  context: packagePath,
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              declaration: false
            }
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  }
};
