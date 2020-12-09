const { StylableWebpackPlugin } = require('@stylable/webpack-plugin');

/** @type {import('webpack').Configuration} */
module.exports = {
  mode: 'development',
  devtool: 'source-map',
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
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  plugins: [new StylableWebpackPlugin()],
};
