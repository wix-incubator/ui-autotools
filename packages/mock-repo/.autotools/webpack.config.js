const path = require('path');
const packagePath = path.resolve(__dirname, '..');
const StylableWebpackPlugin = require('@stylable/webpack-plugin');

module.exports = {
  context: packagePath,
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: '@ts-tools/webpack-loader',
        options: {
          compilerOptions: {
            declaration: false,
            declarationMap: false
          }
        }
      },
      {
        test: /\.css$/,
        exclude: /\.st\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  },
  plugins: [
    new StylableWebpackPlugin()
  ]
};
