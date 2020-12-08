const path = require('path');
const { StylableWebpackPlugin } = require('@stylable/webpack-plugin');

/** @type {import('webpack').Configuration} */
module.exports = {
  context: path.dirname(require.resolve('../package.json')),
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
