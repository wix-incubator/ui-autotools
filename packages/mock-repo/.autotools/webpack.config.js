const path = require('path');
const { StylableWebpackPlugin } = require('@stylable/webpack-plugin');

const packagePath = path.resolve(__dirname, '..');

/** @type {import('webpack').Configuration} */
module.exports = {
  context: packagePath,
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: '@ts-tools/webpack-loader',
      },
      {
        test: /\.css$/,
        exclude: /\.st\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  plugins: [new StylableWebpackPlugin()],
};
