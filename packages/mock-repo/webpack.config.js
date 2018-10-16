const path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: {
    main: ['core-js/shim', './src/index.tsx'],
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: '@ts-tools/webpack-loader',
        options: {
          compilerOptions: {
            declaration: false,
            declarationMap: false
          }
        }
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  output: {
    filename: '[name].js',
    pathinfo: true,
  },
  devServer: {
    disableHostCheck: true,
  }
};
