const StylableWebpackPlugin = require('@stylable/webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: {
    main: ['./src/index.tsx'],
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
  },
  plugins: [
    new StylableWebpackPlugin()
  ]
};
